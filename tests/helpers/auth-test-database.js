import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const normalize = (sql) => sql.replace(/\s+/g, ' ').trim().toLowerCase();

export class AuthTestDatabase {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = [];
    this.passwordResetTokens = [];
    this.emailVerificationTokens = [];
    this.userBackupCodes = [];
    this.outboundEmails = [];
    this._counters = {
      passwordReset: 1,
      emailVerification: 1,
      backupCode: 1,
      email: 1,
      user: 1,
    };
  }

  insertUser({
    id = randomUUID(),
    email,
    firstName,
    lastName,
    nickname = null,
    displayPreference = 'firstName',
    password = 'hashedPassword123',
    isEmailVerified = false,
    has2fa = false,
    isAdmin = false,
    totpSecret = null,
    totpConfirmed = false,
  }) {
    const user = {
      id,
      email,
      first_name: firstName,
      last_name: lastName,
      nickname,
      display_preference: displayPreference,
      password_hash: password,
      is_email_verified: isEmailVerified,
      has_2fa: has2fa,
      is_admin: isAdmin,
      totp_secret: totpSecret,
      totp_confirmed: totpConfirmed,
      created_at: new Date(),
      updated_at: new Date(),
      last_login_at: null,
      theme_preference: 'system',
      language_preference: 'de',
      preferences: {},
    };
    this.users.push(user);
    return user;
  }

  async query(sql, params = []) {
    const normalized = normalize(sql);

    // User queries
    if (normalized.startsWith('select * from users where email = $1')) {
      const user = this.users.find((u) => u.email === params[0]);
      if (user) {
        // Return all fields including password_hash for login verification
        return { rows: [{ ...user }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (normalized.startsWith('select id, email, first_name, last_name, nickname, display_preference, avatar_url, is_email_verified, has_2fa, is_admin, theme_preference, language_preference, preferences, created_at, last_login_at, role from users where id = $1')) {
      const user = this.users.find((u) => u.id === params[0]);
      return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('select id, first_name from users where email = $1')) {
      const user = this.users.find((u) => u.email === params[0]);
      return { rows: user ? [{ id: user.id, first_name: user.first_name }] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('select email, has_2fa, totp_secret, totp_confirmed from users where id = $1')) {
      const user = this.users.find((u) => u.id === params[0]);
      return { rows: user ? [{ email: user.email, has_2fa: user.has_2fa, totp_secret: user.totp_secret, totp_confirmed: user.totp_confirmed }] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('select totp_secret, totp_confirmed from users where id = $1')) {
      const user = this.users.find((u) => u.id === params[0]);
      return { rows: user ? [{ totp_secret: user.totp_secret, totp_confirmed: user.totp_confirmed }] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('select password_hash from users where id = $1')) {
      const user = this.users.find((u) => u.id === params[0]);
      return { rows: user ? [{ password_hash: user.password_hash }] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('select id, email, first_name, is_email_verified from users where id = $1')) {
      const user = this.users.find((u) => u.id === params[0]);
      return { rows: user ? [{ id: user.id, email: user.email, first_name: user.first_name, is_email_verified: user.is_email_verified }] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('select id, email, first_name, is_email_verified from users where email = $1')) {
      const user = this.users.find((u) => u.email === params[0]);
      return { rows: user ? [{ id: user.id, email: user.email, first_name: user.first_name, is_email_verified: user.is_email_verified }] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('select has_2fa from users where id = $1')) {
      const user = this.users.find((u) => u.id === params[0]);
      return { rows: user ? [{ has_2fa: user.has_2fa }] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('insert into users')) {
      const [email, passwordHash, firstName, lastName, nickname, displayPreference] = params;
      const user = {
        id: randomUUID(),
        email,
        first_name: firstName,
        last_name: lastName,
        nickname: nickname || null,
        display_preference: displayPreference || 'firstName',
        password_hash: passwordHash,
        is_email_verified: false,
        has_2fa: false,
        is_admin: false,
        created_at: new Date(),
      };
      this.users.push(user);
      return { rows: [{ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, nickname: user.nickname, display_preference: user.display_preference, is_admin: user.is_admin }], rowCount: 1 };
    }

    if (normalized.startsWith('update users set password_hash = $1, updated_at = current_timestamp where id = $2')) {
      const [passwordHash, userId] = params;
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.password_hash = passwordHash;
        user.updated_at = new Date();
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (normalized.startsWith('update users set is_email_verified = true, updated_at = current_timestamp where id = $1')) {
      const userId = params[0];
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.is_email_verified = true;
        user.updated_at = new Date();
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (normalized.startsWith('update users set last_login_at = current_timestamp where id = $1')) {
      const userId = params[0];
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.last_login_at = new Date();
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (normalized.includes('update users set') && normalized.includes('totp_secret')) {
      const userId = params[0];
      const totpSecret = params[1];
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.totp_secret = totpSecret;
        user.totp_confirmed = params[2] !== undefined ? params[2] : false;
        user.has_2fa = params[2] === true;
        user.updated_at = new Date();
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (normalized.includes('update users set has_2fa = true, totp_confirmed = true')) {
      const userId = params[0];
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.has_2fa = true;
        user.totp_confirmed = true;
        user.updated_at = new Date();
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (normalized.includes('update users set has_2fa = false, totp_secret = null')) {
      const userId = params[0];
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.has_2fa = false;
        user.totp_secret = null;
        user.totp_confirmed = false;
        user.updated_at = new Date();
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (normalized.includes('delete from users where id = $1')) {
      const userId = params[0];
      const index = this.users.findIndex((u) => u.id === userId);
      if (index >= 0) {
        this.users.splice(index, 1);
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // Password reset tokens
    if (normalized.includes('update password_reset_tokens set used = true') && normalized.includes('where user_id = $1')) {
      const userId = params[0];
      let count = 0;
      this.passwordResetTokens.forEach((token) => {
        if (token.user_id === userId && !token.used) {
          token.used = true;
          if (params[1]) token.used_at = params[1];
          count += 1;
        }
      });
      return { rows: [], rowCount: count };
    }

    if (normalized.startsWith('insert into password_reset_tokens')) {
      const [userId, tokenHash, expiresAt] = params;
      const record = {
        id: this._counters.passwordReset++,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt instanceof Date ? expiresAt : new Date(expiresAt),
        used: false,
        created_at: new Date(),
      };
      this.passwordResetTokens.push(record);
      return { rows: [{ id: record.id, expires_at: record.expires_at }], rowCount: 1 };
    }

    if (normalized.startsWith('select id, user_id, token_hash, expires_at, used from password_reset_tokens where id = $1')) {
      const [id] = params;
      const token = this.passwordResetTokens.find((t) => t.id === id);
      return { rows: token ? [{ ...token }] : [], rowCount: token ? 1 : 0 };
    }

    if (normalized.includes('update password_reset_tokens set used = true') && normalized.includes('where id = $1')) {
      const [id] = params;
      const token = this.passwordResetTokens.find((t) => t.id === id);
      if (token) {
        token.used = true;
        if (params[1]) token.used_at = params[1];
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // Email verification tokens
    if (normalized.includes('update email_verification_tokens set used = true') && normalized.includes('where user_id = $1')) {
      const userId = params[0];
      let count = 0;
      this.emailVerificationTokens.forEach((token) => {
        if (token.user_id === userId && !token.used) {
          token.used = true;
          if (params[1]) token.used_at = params[1];
          count += 1;
        }
      });
      return { rows: [], rowCount: count };
    }

    if (normalized.startsWith('insert into email_verification_tokens')) {
      const [userId, tokenHash, expiresAt] = params;
      const record = {
        id: this._counters.emailVerification++,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt instanceof Date ? expiresAt : new Date(expiresAt),
        used: false,
        created_at: new Date(),
      };
      this.emailVerificationTokens.push(record);
      return { rows: [{ id: record.id, expires_at: record.expires_at }], rowCount: 1 };
    }

    if (normalized.startsWith('select id, user_id, token_hash, expires_at, used from email_verification_tokens where id = $1')) {
      const [id] = params;
      const token = this.emailVerificationTokens.find((t) => t.id === id);
      return { rows: token ? [{ ...token }] : [], rowCount: token ? 1 : 0 };
    }

    if (normalized.includes('update email_verification_tokens set used = true') && normalized.includes('where id = $1')) {
      const [id] = params;
      const token = this.emailVerificationTokens.find((t) => t.id === id);
      if (token) {
        token.used = true;
        if (params[1]) token.used_at = params[1];
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // Backup codes
    if (normalized.startsWith('delete from user_backup_codes where user_id = $1')) {
      const userId = params[0];
      const beforeLength = this.userBackupCodes.length;
      this.userBackupCodes = this.userBackupCodes.filter((code) => code.user_id !== userId);
      return { rows: [], rowCount: beforeLength - this.userBackupCodes.length };
    }

    if (normalized.startsWith('select id, code_hash from user_backup_codes where user_id = $1 and used_at is null')) {
      const userId = params[0];
      const codes = this.userBackupCodes.filter((code) => code.user_id === userId && !code.used_at);
      return { rows: codes.map((c) => ({ id: c.id, code_hash: c.code_hash })), rowCount: codes.length };
    }

    if (normalized.startsWith('insert into user_backup_codes')) {
      const [userId, codeHash] = params;
      const record = {
        id: this._counters.backupCode++,
        user_id: userId,
        code_hash: codeHash,
        used_at: null,
        created_at: new Date(),
      };
      this.userBackupCodes.push(record);
      return { rows: [], rowCount: 1 };
    }

    if (normalized.includes('update user_backup_codes set used_at = current_timestamp where id = $1')) {
      const [id] = params;
      const code = this.userBackupCodes.find((c) => c.id === id);
      if (code) {
        code.used_at = new Date();
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // Outbound emails
    if (normalized.startsWith('insert into outbound_emails')) {
      const [recipient, subject, body] = params;
      const record = {
        id: this._counters.email++,
        recipient,
        subject,
        body,
        sent_at: normalized.includes('null') ? null : new Date(),
        created_at: new Date(),
      };
      this.outboundEmails.push(record);
      return { rows: [{ id: record.id }], rowCount: 1 };
    }

    if (normalized.includes('update outbound_emails set sent_at = current_timestamp where id = $1 and sent_at is null')) {
      const [id] = params;
      const email = this.outboundEmails.find((e) => e.id === id);
      if (email) {
        email.sent_at = new Date();
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    throw new Error(`Unsupported query in auth test database: ${sql}`);
  }
}

