import { randomUUID } from 'crypto';
import { createNotification } from './notificationService.js';

const AWARD_LABELS = {
    'friends-gold': 'Friends Gold',
    'friends-silver': 'Friends Silber',
    'friends-bronze': 'Friends Bronze',
};

const CATEGORY_LABELS = {
    'points': 'Punkte',
    'pullups': 'Klimmzüge',
    'pushups': 'Liegestütze',
    'situps': 'Sit-ups',
    'running': 'Laufen',
    'cycling': 'Radfahren'
};

export const grantAward = async (pool, userId, { type, label, periodStart, periodEnd, metadata = {} }) => {
    if (!type || !label) {
        throw new Error('Missing award information');
    }

    const { rows } = await pool.query(
        `INSERT INTO awards (id, user_id, type, label, period_start, period_end, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, type, period_start, period_end)
         DO NOTHING
         RETURNING id, label, type` ,
        [randomUUID(), userId, type, label, periodStart, periodEnd, JSON.stringify(metadata)]
    );

    if (rows.length === 0) {
        return null;
    }

    await createNotification(pool, {
        userId,
        type: 'award-earned',
        title: 'Neue Auszeichnung!',
        message: `Du hast die Auszeichnung "${label}" erhalten.`,
        payload: {
            awardType: type,
            awardLabel: label,
            periodStart,
            periodEnd,
        }
    });

    return rows[0];
};

export const grantLeaderboardAward = async (pool, userId, rank, periodStart, periodEnd, points) => {
    const typeMap = {
        1: 'friends-gold',
        2: 'friends-silver',
        3: 'friends-bronze',
    };
    const type = typeMap[rank];
    if (!type) {
        return null;
    }
    const label = AWARD_LABELS[type];
    return grantAward(pool, userId, {
        type,
        label,
        periodStart,
        periodEnd,
        metadata: { rank, points }
    });
};

export const grantMonthlyChampionAward = async (pool, userId, periodStart, periodEnd, points) => {
    const monthFormatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
    const label = `${monthFormatter.format(periodStart)} Champion`;
    return grantAward(pool, userId, {
        type: 'monthly-champion',
        label,
        periodStart,
        periodEnd,
        metadata: { points }
    });
};

export const grantCategoryRankAward = async (pool, userId, rank, category, scope, periodStart, periodEnd, value) => {
    if (rank > 3) return null;

    const rankNames = { 1: 'Gold', 2: 'Silber', 3: 'Bronze' };
    const scopeNames = { 'global': 'Global', 'friends': 'Friends' };
    const catLabel = CATEGORY_LABELS[category] || category;
    
    // Type konstruieren um Einzigartigkeit zu garantieren
    // z.B. monthly-rank-global-pullups-1
    const type = `monthly-rank-${scope}-${category}-${rank}`;
    const label = `${scopeNames[scope]} ${rankNames[rank]} - ${catLabel}`;

    return grantAward(pool, userId, {
        type,
        label,
        periodStart,
        periodEnd,
        metadata: { rank, category, scope, value }
    });
};
