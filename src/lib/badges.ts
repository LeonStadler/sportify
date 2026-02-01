import type { TFunction } from "i18next";

type BadgeInput = {
  slug?: string | null;
  label?: string | null;
  description?: string | null;
  category?: string | null;
  level?: number | null;
  icon?: string | null;
};

export function getBadgeText(badge: BadgeInput, t: TFunction) {
  const threshold = badge.level ?? "";
  const slug = badge.slug ?? "";
  const labelKey = slug ? `badges.slugs.${slug}.label` : "";
  const descriptionKey = slug ? `badges.slugs.${slug}.description` : "";
  const categoryKey = badge.category ? `badges.categories.${badge.category}` : "";
  const iconKey = badge.icon ? `badges.icons.${badge.icon}` : "";

  const label = labelKey
    ? t(labelKey, { threshold, defaultValue: badge.label ?? slug })
    : badge.label ?? slug;

  const description = badge.description
    ? t(descriptionKey, { threshold, defaultValue: badge.description })
    : descriptionKey
      ? t(descriptionKey, { threshold, defaultValue: "" })
      : "";

  const category = badge.category
    ? t(categoryKey, { defaultValue: badge.category })
    : "";

  const icon = badge.icon
    ? t(iconKey, {
        defaultValue: badge.icon.replace("badge-", ""),
      })
    : "";

  return { label, description, category, icon };
}
