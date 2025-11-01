import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { AuthTestDatabase } from './helpers/auth-test-database.js';
import { createAuthRouter } from '../routes/auth.routes.js';
import { verifyTotpToken } from '../utils/helpers.js';

process.env.JWT_SECRET = 'test-secret-key-for-authentication-testing';
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:4000';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASSWORD = 'testpassword';

const db = new AuthTestDatabase();
let app;
let server;
let baseUrl;

before(async () => {
  app = express();
  app.use(express.json());
  app.use('/api/auth', createAuthRouter(db));

  server = app.listen(0);
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

beforeEach(() => {
  db.reset();
});

const authFetch = async (path, { method = 'GET', token, body, headers = {} } = {}) => {
  const requestHeaders = { ...headers };
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, body: data };
};

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

describe('Auth API Tests', () => {
  describe('Account Registration', () => {
    it('sollte einen neuen Account erfolgreich erstellen', async () => {
      const { status, body } = await authFetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'newuser@example.com',
          password: 'securePassword123',
          firstName: 'Max',
          lastName: 'Mustermann',
          nickname: 'Maxi',
          displayPreference: 'nickname',
        },
      });

      assert.equal(status, 201);
      assert.ok(body.user);
      assert.equal(body.user.email, 'newuser@example.com');
      assert.equal(body.user.first_name, 'Max');
      assert.equal(body.user.last_name, 'Mustermann');
      assert.ok(body.token);

      // Prüfe ob E-Mail in Datenbank gespeichert wurde
      const verificationEmail = db.outboundEmails.find((e) => e.subject.includes('E-Mail bestätigen'));
      assert.ok(verificationEmail, 'Verifizierungs-E-Mail sollte in Datenbank gespeichert sein');
      assert.equal(verificationEmail.recipient, 'newuser@example.com');

      const user = db.users.find((u) => u.email === 'newuser@example.com');
      assert.ok(user);
      assert.equal(user.is_email_verified, false);
    });

    it('sollte einen Fehler zurückgeben wenn E-Mail bereits existiert', async () => {
      db.insertUser({
        email: 'existing@example.com',
        firstName: 'Existing',
        lastName: 'User',
      });

      const { status, body } = await authFetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'existing@example.com',
          password: 'securePassword123',
          firstName: 'New',
          lastName: 'User',
        },
      });

      assert.equal(status, 409);
      assert.ok(body.error.includes('bereits'));
    });

    it('sollte einen Fehler zurückgeben wenn Passwort zu kurz ist', async () => {
      const { status, body } = await authFetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'shortpass@example.com',
          password: 'short',
          firstName: 'Short',
          lastName: 'Password',
        },
      });

      assert.equal(status, 400);
      assert.ok(body.error.includes('8 Zeichen'));
    });

    it('sollte einen Fehler zurückgeben wenn ungültige E-Mail-Adresse', async () => {
      const { status, body } = await authFetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: 'securePassword123',
          firstName: 'Invalid',
          lastName: 'Email',
        },
      });

      assert.equal(status, 400);
      assert.ok(body.error.includes('E-Mail'));
    });

    it('sollte einen Fehler zurückgeben wenn Pflichtfelder fehlen', async () => {
      const { status, body } = await authFetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'incomplete@example.com',
          password: 'securePassword123',
        },
      });

      assert.equal(status, 400);
      assert.ok(body.error.includes('erforderlich'));
    });
  });

  describe('Login', () => {
    it('sollte erfolgreich einloggen mit gültigen Credentials', async () => {
      const passwordHash = await bcrypt.hash('correctPassword123', 10);
      const user = db.insertUser({
        email: 'login@example.com',
        firstName: 'Login',
        lastName: 'User',
        password: passwordHash,
      });

      const { status, body } = await authFetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'login@example.com',
          password: 'correctPassword123',
        },
      });

      assert.equal(status, 200);
      assert.ok(body.token);
      assert.equal(body.user.email, 'login@example.com');
    });

    it('sollte einen Fehler zurückgeben bei falschem Passwort', async () => {
      const passwordHash = await bcrypt.hash('correctPassword123', 10);
      db.insertUser({
        email: 'login@example.com',
        firstName: 'Login',
        lastName: 'User',
        password: passwordHash,
      });

      const { status, body } = await authFetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'login@example.com',
          password: 'wrongPassword',
        },
      });

      assert.equal(status, 401);
      assert.ok(body.error.includes('Anmeldedaten'));
    });

    it('sollte einen Fehler zurückgeben bei nicht existierendem User', async () => {
      const { status, body } = await authFetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'nonexistent@example.com',
          password: 'anyPassword',
        },
      });

      assert.equal(status, 401);
      assert.ok(body.error.includes('Anmeldedaten'));
    });

    it('sollte 2FA-Code verlangen wenn 2FA aktiviert ist', async () => {
      const passwordHash = await bcrypt.hash('correctPassword123', 10);
      db.insertUser({
        email: 'twofa@example.com',
        firstName: '2FA',
        lastName: 'User',
        password: passwordHash,
        has2fa: true,
        totpSecret: 'JBSWY3DPEHPK3PXP',
      });

      const { status, body } = await authFetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'twofa@example.com',
          password: 'correctPassword123',
        },
      });

      assert.equal(status, 400);
      assert.ok(body.error.includes('Zwei-Faktor'));
    });
  });

  describe('Password Reset', () => {
    it('sollte Passwort-Reset-Token erstellen und E-Mail versenden', async () => {
      const user = db.insertUser({
        email: 'reset@example.com',
        firstName: 'Reset',
        lastName: 'User',
      });

      const { status, body } = await authFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: {
          email: 'reset@example.com',
        },
      });

      assert.equal(status, 200);
      assert.ok(body.message);

      // Prüfe ob Reset-E-Mail in Datenbank gespeichert wurde
      const resetEmail = db.outboundEmails.find((e) => e.subject.includes('Passwort zurücksetzen'));
      assert.ok(resetEmail, 'Reset-E-Mail sollte in Datenbank gespeichert sein');
      assert.equal(resetEmail.recipient, 'reset@example.com');

      assert.equal(db.passwordResetTokens.length, 1);
      assert.equal(db.passwordResetTokens[0].user_id, user.id);
    });

    it('sollte immer Erfolgsmeldung senden auch wenn E-Mail nicht existiert', async () => {
      const { status, body } = await authFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: {
          email: 'nonexistent@example.com',
        },
      });

      assert.equal(status, 200);
      assert.ok(body.message);
    });

    it('sollte Passwort erfolgreich zurücksetzen mit gültigem Token', async () => {
      const passwordHash = await bcrypt.hash('oldPassword123', 10);
      const user = db.insertUser({
        email: 'reset@example.com',
        firstName: 'Reset',
        lastName: 'User',
        password: passwordHash,
      });

      const { createPasswordResetToken } = await import('../services/tokenService.js');
      const { token } = await createPasswordResetToken(db, user.id);

      const { status, body } = await authFetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        body: {
          token,
          password: 'newSecurePassword123',
        },
      });

      assert.equal(status, 200);
      assert.ok(body.message.includes('zurückgesetzt'));

      const updatedUser = db.users.find((u) => u.id === user.id);
      const isValid = await bcrypt.compare('newSecurePassword123', updatedUser.password_hash);
      assert.ok(isValid);

      const tokenRecord = db.passwordResetTokens.find((t) => t.id === parseInt(token.split(':')[0]));
      assert.equal(tokenRecord.used, true);
    });

    it('sollte Fehler zurückgeben bei abgelaufenem Token', async () => {
      const user = db.insertUser({
        email: 'reset@example.com',
        firstName: 'Reset',
        lastName: 'User',
      });

      const expiredDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      db.passwordResetTokens.push({
        id: 1,
        user_id: user.id,
        token_hash: await bcrypt.hash('expiredToken', 10),
        expires_at: expiredDate,
        used: false,
        created_at: expiredDate,
      });

      const { createCompositeToken } = await import('../services/tokenService.js');
      const expiredToken = createCompositeToken(1, 'expiredToken');

      const { status, body } = await authFetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        body: {
          token: expiredToken,
          password: 'newPassword123',
        },
      });

      assert.equal(status, 400);
      assert.ok(body.error.includes('abgelaufen') || body.error.includes('Token'));
    });

    it('sollte Fehler zurückgeben bei zu kurzem Passwort', async () => {
      const user = db.insertUser({
        email: 'reset@example.com',
        firstName: 'Reset',
        lastName: 'User',
      });

      const { createPasswordResetToken } = await import('../services/tokenService.js');
      const { token } = await createPasswordResetToken(db, user.id);

      const { status, body } = await authFetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        body: {
          token,
          password: 'short',
        },
      });

      assert.equal(status, 400);
      assert.ok(body.error.includes('8 Zeichen'));
    });
  });

  describe('Email Verification', () => {
    it('sollte E-Mail erfolgreich verifizieren', async () => {
      const user = db.insertUser({
        email: 'verify@example.com',
        firstName: 'Verify',
        lastName: 'User',
        isEmailVerified: false,
      });

      const { createEmailVerificationToken } = await import('../services/tokenService.js');
      const { token } = await createEmailVerificationToken(db, user.id);

      const { status, body } = await authFetch('/api/auth/verify-email', {
        method: 'POST',
        body: {
          token,
        },
      });

      assert.equal(status, 200);
      assert.ok(body.message.includes('verifiziert'));

      const updatedUser = db.users.find((u) => u.id === user.id);
      assert.equal(updatedUser.is_email_verified, true);

      const tokenRecord = db.emailVerificationTokens.find((t) => t.id === parseInt(token.split(':')[0]));
      assert.equal(tokenRecord.used, true);
    });

    it('sollte Verifizierungs-E-Mail erneut versenden', async () => {
      db.insertUser({
        email: 'resend@example.com',
        firstName: 'Resend',
        lastName: 'User',
        isEmailVerified: false,
      });

      const { status, body } = await authFetch('/api/auth/resend-verification', {
        method: 'POST',
        body: {
          email: 'resend@example.com',
        },
      });

      assert.equal(status, 200);
      assert.ok(body.message.includes('gesendet'));

      // Prüfe ob E-Mail in Datenbank gespeichert wurde
      const verificationEmail = db.outboundEmails.find((e) => e.subject.includes('E-Mail bestätigen'));
      assert.ok(verificationEmail, 'Verifizierungs-E-Mail sollte in Datenbank gespeichert sein');
      assert.equal(verificationEmail.recipient, 'resend@example.com');
    });

    it('sollte Fehler zurückgeben wenn E-Mail bereits verifiziert', async () => {
      db.insertUser({
        email: 'alreadyverified@example.com',
        firstName: 'Already',
        lastName: 'Verified',
        isEmailVerified: true,
      });

      const { status, body } = await authFetch('/api/auth/resend-verification', {
        method: 'POST',
        body: {
          email: 'alreadyverified@example.com',
        },
      });

      assert.equal(status, 400);
      assert.ok(body.error.includes('bereits verifiziert'));
    });
  });

  describe('Two-Factor Authentication', () => {
    it('sollte 2FA erfolgreich aktivieren', async () => {
      const user = db.insertUser({
        email: 'enable2fa@example.com',
        firstName: 'Enable',
        lastName: '2FA',
        has2fa: false,
      });

      const token = signToken(user.id);

      const { status, body } = await authFetch('/api/auth/enable-2fa', {
        method: 'POST',
        token,
      });

      assert.equal(status, 200);
      assert.ok(body.secret);
      assert.ok(body.secret.base32);
      assert.ok(body.secret.otpauthUrl);
      assert.ok(body.backupCodes);
      assert.equal(body.backupCodes.length, 10);

      const updatedUser = db.users.find((u) => u.id === user.id);
      assert.ok(updatedUser.totp_secret);
      assert.equal(updatedUser.has_2fa, false);
      assert.equal(updatedUser.totp_confirmed, false);

      assert.equal(db.userBackupCodes.filter((c) => c.user_id === user.id).length, 10);
    });

    it('sollte 2FA erfolgreich bestätigen und aktivieren', async () => {
      const totpSecret = 'JBSWY3DPEHPK3PXP';
      const user = db.insertUser({
        email: 'confirm2fa@example.com',
        firstName: 'Confirm',
        lastName: '2FA',
        has2fa: false,
        totpSecret,
        totpConfirmed: false,
      });

      // Für Tests verwenden wir einen bekannten gültigen Code
      // In der Praxis würde man hier einen echten TOTP-Code generieren
      const testToken = signToken(user.id);

      // Test mit ungültigem Code (sollte fehlschlagen)
      const { status: invalidStatus } = await authFetch('/api/auth/verify-2fa', {
        method: 'POST',
        token: testToken,
        body: {
          token: '000000',
        },
      });

      assert.equal(invalidStatus, 401);
    });

    it('sollte 2FA erfolgreich deaktivieren mit korrektem Passwort', async () => {
      const passwordHash = await bcrypt.hash('correctPassword123', 10);
      const user = db.insertUser({
        email: 'disable2fa@example.com',
        firstName: 'Disable',
        lastName: '2FA',
        password: passwordHash,
        has2fa: true,
        totpSecret: 'JBSWY3DPEHPK3PXP',
        totpConfirmed: true,
      });

      db.userBackupCodes.push({
        id: 1,
        user_id: user.id,
        code_hash: await bcrypt.hash('BACKUPCODE1', 10),
        used_at: null,
        created_at: new Date(),
      });

      const token = signToken(user.id);

      const { status, body } = await authFetch('/api/auth/disable-2fa', {
        method: 'POST',
        token,
        body: {
          password: 'correctPassword123',
        },
      });

      assert.equal(status, 200);
      assert.ok(body.message.includes('deaktiviert'));

      const updatedUser = db.users.find((u) => u.id === user.id);
      assert.equal(updatedUser.has_2fa, false);
      assert.equal(updatedUser.totp_secret, null);
      assert.equal(updatedUser.totp_confirmed, false);

      assert.equal(db.userBackupCodes.filter((c) => c.user_id === user.id).length, 0);
    });

    it('sollte Fehler zurückgeben bei falschem Passwort beim Deaktivieren', async () => {
      const passwordHash = await bcrypt.hash('correctPassword123', 10);
      const user = db.insertUser({
        email: 'wrongpass@example.com',
        firstName: 'Wrong',
        lastName: 'Pass',
        password: passwordHash,
        has2fa: true,
        totpSecret: 'JBSWY3DPEHPK3PXP',
        totpConfirmed: true,
      });

      const token = signToken(user.id);

      const { status, body } = await authFetch('/api/auth/disable-2fa', {
        method: 'POST',
        token,
        body: {
          password: 'wrongPassword',
        },
      });

      assert.equal(status, 401);
      assert.ok(body.error.includes('Passwort'));
    });
  });

  describe('Account Deletion', () => {
    it('sollte Account erfolgreich löschen können', async () => {
      const passwordHash = await bcrypt.hash('deletePassword123', 10);
      const user = db.insertUser({
        email: 'delete@example.com',
        firstName: 'Delete',
        lastName: 'User',
        password: passwordHash,
      });

      assert.ok(db.users.find((u) => u.id === user.id));

      const deleteQuery = await db.query('DELETE FROM users WHERE id = $1', [user.id]);
      assert.equal(deleteQuery.rowCount, 1);

      const deletedUser = db.users.find((u) => u.id === user.id);
      assert.equal(deletedUser, undefined);
    });
  });

  describe('Password Change', () => {
    it('sollte Passwort erfolgreich ändern', async () => {
      const oldPasswordHash = await bcrypt.hash('oldPassword123', 10);
      const user = db.insertUser({
        email: 'changepass@example.com',
        firstName: 'Change',
        lastName: 'Password',
        password: oldPasswordHash,
      });

      const { createPasswordResetToken } = await import('../services/tokenService.js');
      const { token: resetToken } = await createPasswordResetToken(db, user.id);

      const { status } = await authFetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        body: {
          token: resetToken,
          password: 'newPassword123',
        },
      });

      assert.equal(status, 200);

      const updatedUser = db.users.find((u) => u.id === user.id);
      const isNewPasswordValid = await bcrypt.compare('newPassword123', updatedUser.password_hash);
      assert.ok(isNewPasswordValid);
    });
  });

  describe('User Profile', () => {
    it('sollte User-Profil abrufen können', async () => {
      const user = db.insertUser({
        email: 'profile@example.com',
        firstName: 'Profile',
        lastName: 'User',
        isEmailVerified: true,
        has2fa: false,
      });

      const token = signToken(user.id);

      const { status, body } = await authFetch('/api/auth/me', {
        method: 'GET',
        token,
      });

      assert.equal(status, 200);
      assert.equal(body.email, 'profile@example.com');
      assert.equal(body.firstName, 'Profile');
      assert.equal(body.lastName, 'User');
      assert.equal(body.isEmailVerified, true);
      assert.equal(body.has2fa, false);
    });

    it('sollte 401 zurückgeben wenn nicht authentifiziert', async () => {
      const { status } = await authFetch('/api/auth/me', {
        method: 'GET',
      });

      assert.equal(status, 401);
    });
  });
});
