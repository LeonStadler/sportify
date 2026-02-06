import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSummaryUnsubscribeToken,
  createSummaryUnsubscribeUrl,
  verifySummaryUnsubscribeToken,
} from "../services/emailPreferencesService.js";

describe("emailPreferencesService", () => {
  it("creates and verifies summary unsubscribe tokens", () => {
    const previousSecret = process.env.EMAIL_PREFERENCES_SECRET;
    process.env.EMAIL_PREFERENCES_SECRET = "test-email-pref-secret";

    try {
      const token = createSummaryUnsubscribeToken({ userId: "user-123" });
      const payload = verifySummaryUnsubscribeToken(token);
      assert.equal(payload.userId, "user-123");
    } finally {
      if (previousSecret === undefined) {
        delete process.env.EMAIL_PREFERENCES_SECRET;
      } else {
        process.env.EMAIL_PREFERENCES_SECRET = previousSecret;
      }
    }
  });

  it("creates unsubscribe URLs that target the public endpoint", () => {
    const previousSecret = process.env.EMAIL_PREFERENCES_SECRET;
    const previousBaseUrl = process.env.EVENTS_BASE_URL;
    process.env.EMAIL_PREFERENCES_SECRET = "test-email-pref-secret";
    process.env.EVENTS_BASE_URL = "https://example.com";

    try {
      const url = createSummaryUnsubscribeUrl({ userId: "user-456" });
      assert.ok(
        url.startsWith("https://example.com/api/events/emails/unsubscribe"),
        `unexpected url: ${url}`
      );
      assert.ok(url.includes("token="), "unsubscribe URL must contain a token");
    } finally {
      if (previousSecret === undefined) {
        delete process.env.EMAIL_PREFERENCES_SECRET;
      } else {
        process.env.EMAIL_PREFERENCES_SECRET = previousSecret;
      }

      if (previousBaseUrl === undefined) {
        delete process.env.EVENTS_BASE_URL;
      } else {
        process.env.EVENTS_BASE_URL = previousBaseUrl;
      }
    }
  });
});
