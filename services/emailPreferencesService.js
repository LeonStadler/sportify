import jwt from "jsonwebtoken";

const TOKEN_KIND = "email-preferences";
const SUMMARY_UNSUBSCRIBE_PURPOSE = "summary-unsubscribe";

const resolveSecret = () => {
  const secret =
    process.env.EMAIL_PREFERENCES_SECRET ||
    process.env.JWT_SECRET ||
    process.env.EVENTS_CRON_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "sportify-dev-email-preferences-secret";
  }

  throw new Error(
    "Missing EMAIL_PREFERENCES_SECRET (or JWT_SECRET / EVENTS_CRON_SECRET)"
  );
};

const resolveTokenTtl = () =>
  process.env.EMAIL_PREFERENCES_TOKEN_TTL || "180d";

const normalizeBaseUrl = (value) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
};

const resolveAppBaseUrl = () => {
  const candidates = [
    process.env.EVENTS_BASE_URL,
    process.env.FRONTEND_URL,
    process.env.VITE_FRONTEND_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeBaseUrl(candidate);
    if (normalized) return normalized;
  }

  const localPort = process.env.PORT || "3001";
  return `http://localhost:${localPort}`;
};

export const createSummaryUnsubscribeToken = ({ userId }) => {
  if (!userId) {
    throw new Error("userId is required for unsubscribe token");
  }

  return jwt.sign(
    {
      sub: userId,
      kind: TOKEN_KIND,
      purpose: SUMMARY_UNSUBSCRIBE_PURPOSE,
    },
    resolveSecret(),
    { expiresIn: resolveTokenTtl() }
  );
};

export const verifySummaryUnsubscribeToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid unsubscribe token");
  }

  const payload = jwt.verify(token, resolveSecret());
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid unsubscribe token payload");
  }

  if (payload.kind !== TOKEN_KIND) {
    throw new Error("Unexpected token kind");
  }
  if (payload.purpose !== SUMMARY_UNSUBSCRIBE_PURPOSE) {
    throw new Error("Unexpected token purpose");
  }
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Missing token subject");
  }

  return {
    userId: payload.sub,
  };
};

export const createSummaryUnsubscribeUrl = ({ userId }) => {
  const token = createSummaryUnsubscribeToken({ userId });
  const baseUrl = resolveAppBaseUrl();
  const encodedToken = encodeURIComponent(token);
  return `${baseUrl}/api/events/emails/unsubscribe?token=${encodedToken}`;
};
