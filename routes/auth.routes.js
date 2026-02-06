import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";
import { queueEmail } from "../services/emailService.js";
import {
  TokenError,
  createEmailVerificationToken,
  createPasswordResetToken,
  markEmailVerificationTokenUsed,
  markPasswordResetTokenUsed,
  validateEmailVerificationToken,
  validatePasswordResetToken,
} from "../services/tokenService.js";
import {
  buildOtpAuthUrl,
  generateBackupCodes,
  generateTotpSecret,
  getFrontendUrl,
  sendPasswordResetEmail,
  toCamelCase,
  verifyTotpToken,
} from "../utils/helpers.js";

export const createAuthRouter = (pool) => {
  const router = express.Router();

  // GET /api/auth/me - Protected Route
  router.get("/me", authMiddleware, async (req, res) => {
    try {
      const userQuery = `
                SELECT u.id, u.email, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url,
                       u.is_email_verified, u.has_2fa, u.theme_preference, u.language_preference,
                       u.preferences, u.show_in_global_rankings, u.created_at, u.last_login_at, u.role, u.two_factor_enabled_at, u.password_changed_at,
                       (SELECT MIN(created_at) FROM user_backup_codes WHERE user_id = u.id) as backup_codes_created_at
                FROM users u
                WHERE u.id = $1
            `;
      const { rows } = await pool.query(userQuery, [req.user.id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Benutzer nicht gefunden." });
      }

      // Convert snake_case to camelCase
      const user = toCamelCase(rows[0]);

      // IMPORTANT: Date objects from PostgreSQL need to be preserved
      // toCamelCase converts them to empty objects, so we need to restore them
      if (rows[0].last_login_at) {
        user.lastLoginAt =
          rows[0].last_login_at instanceof Date
            ? rows[0].last_login_at.toISOString()
            : rows[0].last_login_at;
      }
      if (rows[0].password_changed_at) {
        user.passwordChangedAt =
          rows[0].password_changed_at instanceof Date
            ? rows[0].password_changed_at.toISOString()
            : rows[0].password_changed_at;
      }
      if (rows[0].two_factor_enabled_at) {
        user.twoFactorEnabledAt =
          rows[0].two_factor_enabled_at instanceof Date
            ? rows[0].two_factor_enabled_at.toISOString()
            : rows[0].two_factor_enabled_at;
      }
      if (rows[0].backup_codes_created_at) {
        user.backupCodesCreatedAt =
          rows[0].backup_codes_created_at instanceof Date
            ? rows[0].backup_codes_created_at.toISOString()
            : rows[0].backup_codes_created_at;
      }

      // Parse preferences if it's a string
      if (user.preferences && typeof user.preferences === "string") {
        try {
          user.preferences = JSON.parse(user.preferences);
        } catch (e) {
          user.preferences = {};
        }
      } else if (!user.preferences) {
        user.preferences = {};
      }
      
      // Ensure reactions settings have defaults if not present
      if (!user.preferences.reactions) {
        user.preferences.reactions = {
          friendsCanSee: true,
          showNames: true,
        };
      } else {
        // Ensure both fields exist with defaults
        if (user.preferences.reactions.friendsCanSee === undefined) {
          user.preferences.reactions.friendsCanSee = true;
        }
        if (user.preferences.reactions.showNames === undefined) {
          user.preferences.reactions.showNames = true;
        }
      }

      // Ensure avatar field is correctly mapped (avatar_url -> avatarUrl -> avatar)
      if (user.avatarUrl !== undefined) {
        user.avatar = user.avatarUrl;
        delete user.avatarUrl;
      }

      // Fix has_2fa -> has2FA conversion (toCamelCase doesn't handle numbers)
      if (user.has_2fa !== undefined) {
        user.has2FA = user.has_2fa;
        delete user.has_2fa;
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Abrufen der Benutzerdaten." });
    }
  });

  // POST /api/auth/register
  router.post("/register", async (req, res) => {
    const {
      email,
      password,
      firstName,
      lastName,
      nickname,
      displayPreference,
      languagePreference,
      invitationToken,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: "Alle erforderlichen Felder müssen ausgefüllt werden.",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
    }

    // Password validation
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Passwort muss mindestens 8 Zeichen lang sein." });
    }

    const normalizedNickname =
      nickname && String(nickname).trim().length > 0
        ? String(nickname).trim()
        : null;
    if (normalizedNickname && /\s/.test(normalizedNickname)) {
      return res
        .status(400)
        .json({ error: "Spitzname darf keine Leerzeichen enthalten." });
    }
    if (normalizedNickname && !/^[A-Za-z0-9_]+$/.test(normalizedNickname)) {
      return res.status(400).json({
        error:
          "Spitzname darf nur Buchstaben, Zahlen und Unterstriche enthalten.",
      });
    }
    if (displayPreference === "nickname" && !normalizedNickname) {
      return res.status(400).json({
        error:
          "Wenn 'Spitzname' als Anzeigename gewählt ist, muss ein Spitzname angegeben werden.",
      });
    }

    if (normalizedNickname) {
      const { rows: duplicateNicknameRows } = await pool.query(
        `SELECT id
         FROM users
         WHERE nickname IS NOT NULL
           AND LOWER(nickname) = LOWER($1)
         LIMIT 1`,
        [normalizedNickname]
      );
      if (duplicateNicknameRows.length > 0) {
        return res.status(409).json({
          error: "Dieser Spitzname ist bereits vergeben.",
        });
      }
    }

    let invitedBy = null;
    let invitationId = null;

    // Validiere und markiere Einladung als verwendet, falls Token vorhanden
    if (invitationToken) {
      try {
        const { validateInvitationToken, markInvitationUsed } = await import(
          "../services/invitationService.js"
        );
        const invitation = await validateInvitationToken(pool, invitationToken);

        // Prüfe ob E-Mail übereinstimmt
        if (invitation.email.toLowerCase() !== email.toLowerCase()) {
          return res.status(400).json({
            error: "Die E-Mail-Adresse stimmt nicht mit der Einladung überein.",
          });
        }

        invitationId = invitation.id;

        // Hole invited_by aus der Einladung
        const { rows: invRows } = await pool.query(
          "SELECT invited_by FROM invitations WHERE id = $1",
          [invitationId]
        );
        if (invRows.length > 0) {
          invitedBy = invRows[0].invited_by;
        }

        // Markiere Einladung als verwendet
        await markInvitationUsed(pool, invitationId);
      } catch (invError) {
        // Wenn Einladung ungültig/abgelaufen, erlaube Registrierung trotzdem
        // aber ohne Einladungsverknüpfung
        console.warn(
          "Invitation validation failed during registration:",
          invError.message
        );
      }
    } else {
      // Auch ohne Token: Prüfe ob es eine ausstehende Einladung für diese E-Mail gibt
      try {
        const { rows: pendingInvitations } = await pool.query(
          `SELECT id, invited_by FROM invitations 
           WHERE email = $1 AND status = 'pending' AND used = false
           ORDER BY created_at DESC
           LIMIT 1`,
          [email.toLowerCase()]
        );

        if (pendingInvitations.length > 0) {
          invitationId = pendingInvitations[0].id;
          invitedBy = pendingInvitations[0].invited_by;

          // Markiere Einladung als verwendet
          const { markInvitationUsed } = await import(
            "../services/invitationService.js"
          );
          await markInvitationUsed(pool, invitationId);
          console.log(
            `✅ Invitation ${invitationId} wurde als verwendet markiert (Registrierung ohne Token)`
          );
        }
      } catch (invError) {
        // Nicht kritisch, weiter machen
        console.warn(
          "Error checking pending invitations during registration:",
          invError.message
        );
      }
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const regLanguage =
        languagePreference === "en" || languagePreference === "de"
          ? languagePreference
          : "de";

      const newUserQuery = `
                INSERT INTO users (email, password_hash, first_name, last_name, nickname, display_preference, weekly_goals, role, password_changed_at, language_preference, theme_preference)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'user', CURRENT_TIMESTAMP, $8, 'system')
                RETURNING id, email, first_name, last_name, nickname, display_preference, role;
            `;
      const values = [
        email,
        password_hash,
        firstName,
        lastName,
        normalizedNickname,
        displayPreference || "firstName",
        "{}",
        regLanguage,
      ];

      const { rows } = await pool.query(newUserQuery, values);
      const rawUser = rows[0];

      // Versuche Verifizierungs-E-Mail zu senden
      let verificationEmailSent = false;
      let verificationToken = null;
      try {
        const tokenResult = await createEmailVerificationToken(
          pool,
          rawUser.id
        );
        verificationToken = tokenResult.token;

        const frontendUrl = getFrontendUrl(req);
        const verificationUrl = `${frontendUrl}/auth/email-verification?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`;

        // Plain-Text-Version für Fallback
        const emailBody = `Hallo ${firstName},

bitte bestätige deine E-Mail-Adresse, indem du auf folgenden Link klickst:

${verificationUrl}

Alternativ kannst du diesen Code manuell eingeben:
${verificationToken}

Dieser Link ist 24 Stunden lang gültig.

Dein Sportify-Team`;

        // Verwende das neue E-Mail-Template
        const { createActionEmail } = await import(
          "../utils/emailTemplates.js"
        );
        const emailHtml = createActionEmail({
          greeting: `Hallo ${firstName},`,
          title: "E-Mail-Adresse bestätigen",
          message:
            "Bitte bestätige deine E-Mail-Adresse, um dein Sportify-Konto zu aktivieren.",
          buttonText: "E-Mail-Adresse bestätigen",
          buttonUrl: verificationUrl,
          additionalText: "Dieser Link ist 24 Stunden lang gültig.",
          frontendUrl,
          preheader: "E-Mail-Adresse bestätigen",
        });

        await queueEmail(pool, {
          recipient: email,
          subject: "Sportify – E-Mail bestätigen",
          body: emailBody,
          html: emailHtml,
        });
        verificationEmailSent = true;
      } catch (mailError) {
        console.error(
          "Fehler beim Versenden der Verifizierungs-E-Mail:",
          mailError.message
        );
        // User wurde erstellt, aber E-Mail konnte nicht versendet werden
        // Das ist nicht kritisch - User kann später erneut anfordern
      }

      // Convert snake_case to camelCase
      const user = toCamelCase(rawUser);

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Gib invitedBy zurück, falls eine Invitation verwendet wurde
      res.status(201).json({ user, token, invitedBy: invitedBy || undefined });
    } catch (error) {
      console.error("Registration error:", error.message);
      if (
        error.code === "23505" &&
        typeof error.constraint === "string" &&
        error.constraint.includes("nickname")
      ) {
        return res.status(409).json({
          error: "Dieser Spitzname ist bereits vergeben.",
        });
      }
      if (error.code === "23505") {
        // Unique violation
        return res.status(409).json({
          error: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.",
        });
      }
      if (error.code === "23514" && error.constraint === "nickname_format") {
        return res.status(400).json({
          error:
            "Spitzname darf nur Buchstaben, Zahlen und Unterstriche enthalten.",
        });
      }
      const errorMessage =
        process.env.NODE_ENV === "development"
          ? error.message ||
            error.detail ||
            "Serverfehler bei der Registrierung."
          : "Serverfehler bei der Registrierung.";
      res.status(500).json({ error: errorMessage });
    }
  });

  // POST /api/auth/login
  router.post("/login", async (req, res) => {
    const { email, password, twoFactorToken, backupCode, rememberMe } =
      req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "E-Mail und Passwort sind erforderlich." });
    }

    try {
      const userQuery = "SELECT * FROM users WHERE email = $1";
      const { rows } = await pool.query(userQuery, [email]);

      if (rows.length === 0) {
        return res.status(401).json({ error: "Ungültige Anmeldedaten." });
      }

      const rawUser = rows[0];
      const isMatch = await bcrypt.compare(password, rawUser.password_hash);

      if (!isMatch) {
        return res.status(401).json({ error: "Ungültige Anmeldedaten." });
      }

      if (rawUser.has_2fa) {
        if (!twoFactorToken && !backupCode) {
          // Return 200 with requires2FA flag instead of 400 to avoid browser console error
          // This is expected behavior, not an error
          return res.status(200).json({
            requires2FA: true,
            message: "Zwei-Faktor-Authentifizierungscode erforderlich.",
          });
        }

        const secret = rawUser.totp_secret;

        if (twoFactorToken) {
          if (!secret) {
            return res
              .status(500)
              .json({ error: "2FA-Konfiguration ist unvollständig." });
          }
          const isValidToken = verifyTotpToken(twoFactorToken, secret);
          if (!isValidToken) {
            return res
              .status(401)
              .json({ error: "Ungültiger Zwei-Faktor-Code." });
          }
        } else if (backupCode) {
          const normalizedCode = String(backupCode)
            .replace(/\s+/g, "")
            .toUpperCase();
          const { rows: backupRows } = await pool.query(
            "SELECT id, code_hash FROM user_backup_codes WHERE user_id = $1 AND used_at IS NULL",
            [rawUser.id]
          );

          let matchedCodeId = null;
          for (const backupRow of backupRows) {
            const matches = await bcrypt.compare(
              normalizedCode,
              backupRow.code_hash
            );
            if (matches) {
              matchedCodeId = backupRow.id;
              break;
            }
          }

          if (!matchedCodeId) {
            return res.status(401).json({ error: "Ungültiger Backup-Code." });
          }

          await pool.query(
            "UPDATE user_backup_codes SET used_at = CURRENT_TIMESTAMP WHERE id = $1",
            [matchedCodeId]
          );
        }
      }

      // Set token expiration based on rememberMe flag
      // With rememberMe: 30 days, without: 1 day
      const tokenExpiration = rememberMe ? "30d" : "1d";
      const token = jwt.sign({ userId: rawUser.id }, process.env.JWT_SECRET, {
        expiresIn: tokenExpiration,
      });

      // Update last_login_at BEFORE converting to camelCase so the updated value is included
      await pool.query(
        "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1",
        [rawUser.id]
      );

      // Reload user to get updated last_login_at and all other fields
      const { rows: updatedRows } = await pool.query(
        `
                SELECT u.id, u.email, u.first_name, u.last_name, u.nickname, u.display_preference, u.avatar_url,
                       u.is_email_verified, u.has_2fa, u.theme_preference, u.language_preference,
                       u.preferences, u.show_in_global_rankings, u.created_at, u.last_login_at, u.role, u.two_factor_enabled_at, u.password_changed_at,
                       (SELECT MIN(created_at) FROM user_backup_codes WHERE user_id = u.id) as backup_codes_created_at
                FROM users u
                WHERE u.id = $1
            `,
        [rawUser.id]
      );
      const updatedUser = updatedRows[0] || rawUser;

      // Don't send password hash to client
      delete updatedUser.password_hash;
      delete updatedUser.totp_secret;
      delete updatedUser.totp_confirmed;

      // Convert snake_case to camelCase
      const user = toCamelCase(updatedUser);

      // IMPORTANT: Date objects from PostgreSQL need to be preserved
      // toCamelCase converts them to empty objects, so we need to restore them
      if (updatedUser.last_login_at) {
        user.lastLoginAt =
          updatedUser.last_login_at instanceof Date
            ? updatedUser.last_login_at.toISOString()
            : updatedUser.last_login_at;
      }
      if (updatedUser.password_changed_at) {
        user.passwordChangedAt =
          updatedUser.password_changed_at instanceof Date
            ? updatedUser.password_changed_at.toISOString()
            : updatedUser.password_changed_at;
      }
      if (updatedUser.two_factor_enabled_at) {
        user.twoFactorEnabledAt =
          updatedUser.two_factor_enabled_at instanceof Date
            ? updatedUser.two_factor_enabled_at.toISOString()
            : updatedUser.two_factor_enabled_at;
      }
      if (updatedUser.backup_codes_created_at) {
        user.backupCodesCreatedAt =
          updatedUser.backup_codes_created_at instanceof Date
            ? updatedUser.backup_codes_created_at.toISOString()
            : updatedUser.backup_codes_created_at;
      }

      // Fix has_2fa -> has2FA conversion (toCamelCase doesn't handle numbers)
      if (user.has_2fa !== undefined) {
        user.has2FA = user.has_2fa;
        delete user.has_2fa;
      }

      res.json({ user, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Serverfehler beim Login." });
    }
  });

  // POST /api/auth/reset-password/confirm - Complete Password Reset (with token)
  // Wird verwendet um das Passwort mit einem Token zurückzusetzen
  router.post("/reset-password/confirm", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ error: "Token und neues Passwort sind erforderlich." });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ error: "Passwort muss mindestens 8 Zeichen lang sein." });
      }

      const tokenData = await validatePasswordResetToken(pool, token);
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      await pool.query(
        "UPDATE users SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [password_hash, tokenData.userId]
      );
      await markPasswordResetTokenUsed(pool, tokenData.id);

      res.json({ message: "Passwort wurde erfolgreich zurückgesetzt." });
    } catch (error) {
      if (error instanceof TokenError) {
        return res.status(400).json({ error: error.message });
      }
      console.error("Confirm reset password error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Bestätigen des Passwort-Resets." });
    }
  });

  // POST /api/auth/confirm-reset-password - Alias für /reset-password/confirm (für Frontend-Kompatibilität)
  router.post("/confirm-reset-password", async (req, res) => {
    // Weiterleitung zu /reset-password/confirm
    req.url = "/reset-password/confirm";
    req.path = "/reset-password/confirm";
    return router.handle(req, res);
  });

  // POST /api/auth/verify-email
  router.post("/verify-email", async (req, res) => {
    const client = await pool.connect();
    let transactionStarted = false;
    try {
      const { token } = req.body;

      if (!token) {
        return res
          .status(400)
          .json({ error: "Verifizierungstoken ist erforderlich." });
      }

      await client.query("BEGIN");
      transactionStarted = true;

      // Validiere Token (innerhalb der Transaktion um Race Conditions zu vermeiden)
      const tokenData = await validateEmailVerificationToken(client, token);

      // Prüfe ob User bereits verifiziert ist
      const userCheck = await client.query(
        "SELECT is_email_verified FROM users WHERE id = $1 FOR UPDATE",
        [tokenData.userId]
      );

      if (userCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;
        return res.status(404).json({ error: "Benutzer nicht gefunden." });
      }

      // Wenn bereits verifiziert, Token trotzdem als verwendet markieren
      if (userCheck.rows[0].is_email_verified) {
        await markEmailVerificationTokenUsed(client, tokenData.id);
        await client.query("COMMIT");
        transactionStarted = false;
        return res.json({ message: "E-Mail wurde bereits verifiziert." });
      }

      // Verifiziere User und markiere Token als verwendet (in Transaktion)
      await client.query(
        "UPDATE users SET is_email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [tokenData.userId]
      );
      await markEmailVerificationTokenUsed(client, tokenData.id);

      await client.query("COMMIT");
      transactionStarted = false;
      res.json({ message: "E-Mail erfolgreich verifiziert." });
    } catch (error) {
      if (transactionStarted) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          console.error("Rollback error:", rollbackError);
        }
      }
      if (error instanceof TokenError) {
        return res.status(400).json({ error: error.message });
      }
      console.error("Verify email error:", error.message);
      res
        .status(500)
        .json({ error: "Serverfehler bei der E-Mail-Verifizierung." });
    } finally {
      client.release();
    }
  });

  // POST /api/auth/resend-verification
  router.post("/resend-verification", async (req, res) => {
    try {
      // Optional: Auth Token aus Header
      let userId = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (e) {
          // Token ungültig, verwende E-Mail statt User-ID
        }
      }

      const { email } = req.body;

      let user;
      if (userId) {
        // Wenn authentifiziert, verwende User-ID
        const { rows } = await pool.query(
          "SELECT id, email, first_name, is_email_verified FROM users WHERE id = $1",
          [userId]
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: "Benutzer nicht gefunden." });
        }
        user = rows[0];
      } else if (email) {
        // Wenn nicht authentifiziert, verwende E-Mail
        const { rows } = await pool.query(
          "SELECT id, email, first_name, is_email_verified FROM users WHERE email = $1",
          [email]
        );
        if (rows.length === 0) {
          // Aus Sicherheitsgründen: Immer Erfolgsmeldung
          return res.json({
            message:
              "Falls ein Konto mit dieser E-Mail existiert, wurde eine Verifizierungs-E-Mail gesendet.",
          });
        }
        user = rows[0];
      } else {
        return res.status(400).json({
          error: "E-Mail-Adresse oder Authentifizierung erforderlich.",
        });
      }

      if (user.is_email_verified) {
        return res
          .status(400)
          .json({ error: "E-Mail wurde bereits verifiziert." });
      }

      const { token: verificationToken } = await createEmailVerificationToken(
        pool,
        user.id
      );

      const frontendUrl = getFrontendUrl(req);
      const verificationUrl = `${frontendUrl}/auth/email-verification?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(user.email)}`;

      // Plain-Text-Version für Fallback
      const emailBody = `Hallo ${user.first_name},

bitte bestätige deine E-Mail-Adresse, indem du auf folgenden Link klickst:

${verificationUrl}

Dieser Link ist 24 Stunden lang gültig.

Dein Sportify-Team`;

      // Verwende das neue E-Mail-Template
      const { createActionEmail } = await import("../utils/emailTemplates.js");
      const emailHtml = createActionEmail({
        greeting: `Hallo ${user.first_name},`,
        title: "E-Mail-Adresse bestätigen",
        message:
          "Bitte bestätige deine E-Mail-Adresse, um dein Sportify-Konto zu aktivieren.",
        buttonText: "E-Mail-Adresse bestätigen",
        buttonUrl: verificationUrl,
        additionalText: "Dieser Link ist 24 Stunden lang gültig.",
        frontendUrl,
        preheader: "E-Mail-Adresse bestätigen",
      });

      try {
        await queueEmail(pool, {
          recipient: user.email,
          subject: "Sportify – E-Mail bestätigen",
          body: emailBody,
          html: emailHtml,
        });

        console.log(
          "✅ Verifizierungs-E-Mail erfolgreich erneut versendet an:",
          user.email
        );
        res.json({ message: "Verifizierungs-E-Mail wurde erneut gesendet." });
      } catch (mailError) {
        console.error(
          "❌ Fehler beim erneuten Versenden der Verifizierungs-E-Mail:",
          mailError
        );
        console.error("   Fehler-Details:", {
          message: mailError.message,
          code: mailError.code,
          response: mailError.response,
        });
        return res.status(500).json({
          error:
            "Verifizierungs-E-Mail konnte nicht versendet werden. Bitte versuche es später erneut.",
        });
      }
    } catch (error) {
      if (error instanceof TokenError) {
        return res.status(400).json({ error: error.message });
      }
      console.error("Resend verification error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Senden der Verifizierungs-E-Mail." });
    }
  });

  // POST /api/auth/enable-2fa - Enable Two-Factor Authentication
  router.post("/enable-2fa", authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        "SELECT email, has_2fa, totp_secret, totp_confirmed FROM users WHERE id = $1",
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Benutzer nicht gefunden." });
      }

      const user = rows[0];

      if (user.has_2fa && user.totp_confirmed) {
        return res.status(400).json({
          error: "Zwei-Faktor-Authentifizierung ist bereits aktiviert.",
        });
      }

      const secret = generateTotpSecret();
      const otpLabel = user.email || `user-${req.user.id}`;
      const otpauthUrl = buildOtpAuthUrl(secret, otpLabel);
      const backupCodes = generateBackupCodes();
      const hashedBackupCodes = await Promise.all(
        backupCodes.map(async (code) => {
          const normalized = code.toUpperCase();
          return bcrypt.hash(normalized, 12);
        })
      );

      try {
        await client.query("BEGIN");
        await client.query(
          "UPDATE users SET totp_secret = $1, totp_confirmed = false, has_2fa = false, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [secret, req.user.id]
        );
        await client.query("DELETE FROM user_backup_codes WHERE user_id = $1", [
          req.user.id,
        ]);
        for (const hashedCode of hashedBackupCodes) {
          await client.query(
            "INSERT INTO user_backup_codes (user_id, code_hash) VALUES ($1, $2)",
            [req.user.id, hashedCode]
          );
        }
        await client.query("COMMIT");
      } catch (transactionError) {
        await client.query("ROLLBACK");
        throw transactionError;
      }

      res.json({
        secret: {
          base32: secret,
          otpauthUrl,
        },
        backupCodes,
        message:
          "Zwei-Faktor-Authentifizierung vorbereitet. Bitte Code eingeben, um zu bestätigen.",
      });
    } catch (error) {
      console.error("Enable 2FA error:", error);
      res.status(500).json({ error: "Serverfehler beim Aktivieren der 2FA." });
    } finally {
      client.release();
    }
  });

  // POST /api/auth/verify-2fa - Confirm Two-Factor Authentication setup
  router.post("/verify-2fa", authMiddleware, async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res
          .status(400)
          .json({ error: "Ein TOTP-Code ist erforderlich." });
      }

      const { rows } = await pool.query(
        "SELECT totp_secret, totp_confirmed FROM users WHERE id = $1",
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Benutzer nicht gefunden." });
      }

      const { totp_secret: secret } = rows[0];

      if (!secret) {
        return res
          .status(400)
          .json({ error: "Kein TOTP-Setup gefunden. Bitte erneut starten." });
      }

      const isValid = verifyTotpToken(token, secret);

      if (!isValid) {
        return res.status(401).json({ error: "Ungültiger TOTP-Code." });
      }

      await pool.query(
        "UPDATE users SET has_2fa = true, totp_confirmed = true, two_factor_enabled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [req.user.id]
      );

      res.json({
        message: "Zwei-Faktor-Authentifizierung wurde erfolgreich aktiviert.",
      });
    } catch (error) {
      console.error("Verify 2FA error:", error);
      res.status(500).json({ error: "Serverfehler beim Bestätigen der 2FA." });
    }
  });

  // POST /api/auth/backup-codes/consume - Consume a backup code
  router.post("/backup-codes/consume", authMiddleware, async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res
          .status(400)
          .json({ error: "Ein Backup-Code ist erforderlich." });
      }

      const normalizedCode = String(code).replace(/\s+/g, "").toUpperCase();
      const { rows } = await pool.query(
        "SELECT id, code_hash FROM user_backup_codes WHERE user_id = $1 AND used_at IS NULL",
        [req.user.id]
      );

      let matchedCodeId = null;
      for (const row of rows) {
        const matches = await bcrypt.compare(normalizedCode, row.code_hash);
        if (matches) {
          matchedCodeId = row.id;
          break;
        }
      }

      if (!matchedCodeId) {
        return res.status(404).json({
          error: "Backup-Code wurde nicht gefunden oder bereits verwendet.",
        });
      }

      await pool.query(
        "UPDATE user_backup_codes SET used_at = CURRENT_TIMESTAMP WHERE id = $1",
        [matchedCodeId]
      );

      res.json({ message: "Backup-Code wurde erfolgreich verwendet." });
    } catch (error) {
      console.error("Consume backup code error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Verwenden des Backup-Codes." });
    }
  });

  // POST /api/auth/backup-codes/rotate - Generate new backup codes
  router.post("/backup-codes/rotate", authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        "SELECT has_2fa FROM users WHERE id = $1",
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Benutzer nicht gefunden." });
      }

      if (!rows[0].has_2fa) {
        return res.status(400).json({
          error: "Backup-Codes können nur für aktive 2FA erneuert werden.",
        });
      }

      const backupCodes = generateBackupCodes();
      const hashedBackupCodes = await Promise.all(
        backupCodes.map(async (code) => bcrypt.hash(code.toUpperCase(), 12))
      );

      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM user_backup_codes WHERE user_id = $1", [
          req.user.id,
        ]);
        for (const hashedCode of hashedBackupCodes) {
          await client.query(
            "INSERT INTO user_backup_codes (user_id, code_hash) VALUES ($1, $2)",
            [req.user.id, hashedCode]
          );
        }
        await client.query("COMMIT");
      } catch (transactionError) {
        await client.query("ROLLBACK");
        throw transactionError;
      }

      res.json({
        backupCodes,
        message: "Neue Backup-Codes wurden erfolgreich generiert.",
      });
    } catch (error) {
      console.error("Rotate backup codes error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Erneuern der Backup-Codes." });
    } finally {
      client.release();
    }
  });

  // POST /api/auth/disable-2fa - Disable Two-Factor Authentication
  router.post("/disable-2fa", authMiddleware, async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res
          .status(400)
          .json({ error: "Passwort ist zur Bestätigung erforderlich." });
      }

      // Verify password
      const userQuery = "SELECT password_hash FROM users WHERE id = $1";
      const { rows } = await pool.query(userQuery, [req.user.id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Benutzer nicht gefunden." });
      }

      const isMatch = await bcrypt.compare(password, rows[0].password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: "Ungültiges Passwort." });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          "UPDATE users SET has_2fa = false, totp_secret = NULL, totp_confirmed = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [req.user.id]
        );
        await client.query("DELETE FROM user_backup_codes WHERE user_id = $1", [
          req.user.id,
        ]);
        await client.query("COMMIT");
      } catch (transactionError) {
        await client.query("ROLLBACK");
        throw transactionError;
      } finally {
        client.release();
      }

      res.json({ message: "2FA wurde erfolgreich deaktiviert." });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      res
        .status(500)
        .json({ error: "Serverfehler beim Deaktivieren der 2FA." });
    }
  });

  // POST /api/auth/forgot-password - Request Password Reset
  router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body || {};

      // Validierung
      if (!email || typeof email !== "string" || !email.trim()) {
        return res
          .status(400)
          .json({ error: "E-Mail-Adresse ist erforderlich." });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // E-Mail-Format validieren
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
      }

      // Prüfe ob User existiert
      const userResult = await pool.query(
        "SELECT id, first_name, email FROM users WHERE LOWER(email) = $1",
        [normalizedEmail]
      );

      // Aus Sicherheitsgründen: Erfolgsmeldung senden, auch wenn User nicht existiert
      if (userResult.rows.length === 0) {
        return res.status(200).json({
          message:
            "Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.",
          success: true,
        });
      }

      // User existiert - erstelle Token und versende E-Mail
      const user = userResult.rows[0];
      const userId = user.id;
      const userName = user.first_name || "Benutzer";
      const userEmail = user.email;

      // Erstelle Reset-Token
      let resetToken;
      try {
        const tokenResult = await createPasswordResetToken(pool, userId);
        resetToken = tokenResult.token;
      } catch (tokenError) {
        console.error(
          "Fehler beim Erstellen des Passwort-Reset-Tokens:",
          tokenError
        );
        // Token-Erstellung fehlgeschlagen - Erfolgsmeldung aus Sicherheitsgründen
        return res.status(200).json({
          message:
            "Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.",
          success: true,
        });
      }

      // Versende E-Mail mit dem neuen Template
      try {
        await sendPasswordResetEmail(
          pool,
          userEmail,
          resetToken,
          userName,
          req
        );
      } catch (emailError) {
        console.error(
          "Fehler beim Versenden der Passwort-Reset-E-Mail:",
          emailError
        );
        // E-Mail-Versand fehlgeschlagen - aber Token wurde bereits erstellt
      }

      // Erfolgsmeldung
      return res.status(200).json({
        message:
          "Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.",
        success: true,
      });
    } catch (error) {
      console.error("Unerwarteter Fehler beim Passwort-Reset:", error);
      // Aus Sicherheitsgründen: Auch bei unerwarteten Fehlern Erfolgsmeldung
      return res.status(200).json({
        message:
          "Falls die E-Mail-Adresse existiert, wurde eine Zurücksetzungs-E-Mail gesendet.",
        success: true,
      });
    }
  });

  return router;
};
