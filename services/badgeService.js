import { randomUUID } from 'crypto';
import {
    LIFETIME_ACTIVITY_BADGES,
    WEEKLY_PROGRESS_BADGES
} from '../config/badges.js';
import { createNotification } from './notificationService.js';

let badgeCatalogInitialized = false;
let badgeCatalogInitPromise = null;

const formatText = (template, threshold, context = {}) => {
    if (!template) return '';
    return template
        .replace('{threshold}', threshold)
        .replace('{level}', threshold)
        .replace('{month}', context.month || '')
        .replace('{year}', context.year || '');
};

const ensureBadgeRecord = async (pool, definition, threshold) => {
    const level = threshold;
    const label = formatText(definition.label, threshold);
    const description = formatText(definition.description, threshold);

    const { rows } = await pool.query(
        `INSERT INTO badges (id, slug, category, level, label, description, icon, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug, COALESCE(level, 0))
         DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon
         RETURNING id, slug, category, level, label, description, icon`,
        [
            randomUUID(),
            definition.slug,
            definition.category,
            level,
            label,
            description,
            definition.icon,
            JSON.stringify({ thresholds: definition.thresholds || [] })
        ]
    );

    return rows[0];
};

const ensureBadgeCatalog = async (pool) => {
    if (badgeCatalogInitialized) {
        return;
    }

    if (!badgeCatalogInitPromise) {
        badgeCatalogInitPromise = (async () => {
            for (const badge of WEEKLY_PROGRESS_BADGES) {
                for (const threshold of badge.thresholds) {
                    await ensureBadgeRecord(pool, badge, threshold);
                }
            }

            for (const badge of LIFETIME_ACTIVITY_BADGES) {
                for (const threshold of badge.thresholds) {
                    await ensureBadgeRecord(pool, badge, threshold);
                }
            }
        })()
            .then(() => {
                badgeCatalogInitialized = true;
            })
            .catch((error) => {
                badgeCatalogInitialized = false;
                throw error;
            })
            .finally(() => {
                badgeCatalogInitPromise = null;
            });
    }

    if (badgeCatalogInitPromise) {
        await badgeCatalogInitPromise;
    }
};

const getBadgeBySlugAndLevel = async (pool, slug, level) => {
    const { rows } = await pool.query(
        `SELECT id, slug, label, category, level FROM badges WHERE slug = $1 AND COALESCE(level, 0) = COALESCE($2, 0)`
        , [slug, level]
    );
    return rows[0] || null;
};

const grantBadge = async (pool, userId, badge, context = {}) => {
    if (!badge) return null;

    const existing = await pool.query(
        `SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2`,
        [userId, badge.id]
    );

    if (existing.rowCount > 0) {
        return null;
    }

    const userBadgeId = randomUUID();
    await pool.query(
        `INSERT INTO user_badges (id, user_id, badge_id, context)
         VALUES ($1, $2, $3, $4)`,
        [userBadgeId, userId, badge.id, JSON.stringify(context)]
    );

    await createNotification(pool, {
        userId,
        type: 'badge-earned',
        title: 'Neue Auszeichnung!',
        message: `Du hast das Badge "${badge.label}" erhalten.`,
        payload: {
            badgeSlug: badge.slug,
            badgeLabel: badge.label,
            badgeLevel: badge.level,
        },
    });

    return {
        id: userBadgeId,
        slug: badge.slug,
        label: badge.label,
        level: badge.level,
    };
};

const incrementProgress = async (pool, userId, slug, increment = 1) => {
    const { rows } = await pool.query(
        `INSERT INTO user_badge_progress (id, user_id, badge_slug, counter)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, badge_slug)
         DO UPDATE SET counter = user_badge_progress.counter + $5, updated_at = NOW()
         RETURNING counter`,
        [randomUUID(), userId, slug, increment, increment]
    );
    return rows[0]?.counter || increment;
};

export const badgeService = {
    ensureBadgeCatalog,
    async handleWeeklyProgress(pool, userId, slug, achieved) {
        await ensureBadgeCatalog(pool);

        if (!achieved) {
            return [];
        }

        const progressCount = await incrementProgress(pool, userId, slug, 1);
        const badgeDefinition = WEEKLY_PROGRESS_BADGES.find((item) => item.slug === slug);
        if (!badgeDefinition) {
            return [];
        }

        const earned = [];
        for (const threshold of badgeDefinition.thresholds) {
            if (progressCount === threshold) {
                const badge = await getBadgeBySlugAndLevel(pool, slug, threshold);
                const granted = await grantBadge(pool, userId, badge, { progressCount });
                if (granted) {
                    earned.push(granted);
                }
            }
        }
        return earned;
    },
    async handleLifetimeMilestones(pool, userId, activityType, totalQuantity) {
        await ensureBadgeCatalog(pool);
        const definition = LIFETIME_ACTIVITY_BADGES.find((item) => item.activityType === activityType);
        if (!definition) {
            return null;
        }

        const earnedBadges = [];
        for (const threshold of definition.thresholds) {
            if (totalQuantity >= threshold) {
                const badge = await getBadgeBySlugAndLevel(pool, definition.slug, threshold);
                const granted = await grantBadge(pool, userId, badge, { activityType, totalQuantity });
                if (granted) {
                    earnedBadges.push(granted);
                }
            }
        }
        return earnedBadges;
    },
    async grantCustomBadge(pool, userId, { slug, label, description, icon, level = null, context = {} }) {
        const { rows } = await pool.query(
            `INSERT INTO badges (id, slug, category, level, label, description, icon)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (slug, COALESCE(level, 0))
             DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon
             RETURNING id, slug, label, level`,
            [randomUUID(), slug, 'custom', level, label, description, icon]
        );
        const badge = rows[0];
        return grantBadge(pool, userId, badge, context);
    }
};
