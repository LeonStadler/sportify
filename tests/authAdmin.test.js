import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createPasswordResetToken,
  validateEmailVerificationToken,
  TokenError,
} from '../services/tokenService.js';
import { createInvitation } from '../services/invitationService.js';
import { createAdminMiddleware } from '../middleware/adminMiddleware.js';

class FakePool {
  constructor() {
    this.passwordResetTokens = [];
    this.emailVerificationTokens = [];
    this.invitations = [];
    this.users = new Map();
    this.emailLog = [];
    this._counters = {
      passwordReset: 1,
      emailVerification: 1,
      invitation: 1,
    };
  }

  addUser(user) {
    this.users.set(user.id, { ...user });
  }

  async query(sql, params = []) {
    const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();

    if (normalized.startsWith('update password_reset_tokens set used = true, used_at = $2 where user_id = $1 and used = false')) {
      const [userId, usedAt] = params;
      let count = 0;
      this.passwordResetTokens.forEach((token) => {
        if (token.user_id === userId && !token.used) {
          token.used = true;
          token.used_at = usedAt instanceof Date ? new Date(usedAt) : usedAt;
          count += 1;
        }
      });
      return { rowCount: count, rows: [] };
    }

    if (normalized.startsWith('update password_reset_tokens set used = true where user_id = $1 and used = false')) {
      const [userId] = params;
      let count = 0;
      this.passwordResetTokens.forEach((token) => {
        if (token.user_id === userId && !token.used) {
          token.used = true;
          count += 1;
        }
      });
      return { rowCount: count, rows: [] };
    }

    if (normalized.startsWith('insert into password_reset_tokens')) {
      const [userId, tokenHash, expiresAt] = params;
      const record = {
        id: this._counters.passwordReset++,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt instanceof Date ? new Date(expiresAt) : expiresAt,
        used: false,
      };
      this.passwordResetTokens.push(record);
      return { rowCount: 1, rows: [{ id: record.id, expires_at: record.expires_at }] };
    }

    if (normalized.startsWith('select id, user_id, token_hash, expires_at, used from password_reset_tokens where id = $1')) {
      const [id] = params;
      const record = this.passwordResetTokens.find((token) => token.id === id);
      return { rowCount: record ? 1 : 0, rows: record ? [record] : [] };
    }

    if (normalized.startsWith('update password_reset_tokens set used = true, used_at = $2 where id = $1')) {
      const [id, usedAt] = params;
      const record = this.passwordResetTokens.find((token) => token.id === id);
      if (record) {
        record.used = true;
        record.used_at = usedAt instanceof Date ? new Date(usedAt) : usedAt;
        return { rowCount: 1, rows: [] };
      }
      return { rowCount: 0, rows: [] };
    }

    if (normalized.startsWith('update email_verification_tokens set used = true, used_at = $2 where user_id = $1 and used = false')) {
      const [userId, usedAt] = params;
      let count = 0;
      this.emailVerificationTokens.forEach((token) => {
        if (token.user_id === userId && !token.used) {
          token.used = true;
          token.used_at = usedAt instanceof Date ? new Date(usedAt) : usedAt;
          count += 1;
        }
      });
      return { rowCount: count, rows: [] };
    }

    if (normalized.startsWith('insert into email_verification_tokens')) {
      const [userId, tokenHash, expiresAt] = params;
      const record = {
        id: this._counters.emailVerification++,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt instanceof Date ? new Date(expiresAt) : expiresAt,
        used: false,
      };
      this.emailVerificationTokens.push(record);
      return { rowCount: 1, rows: [{ id: record.id, expires_at: record.expires_at }] };
    }

    if (normalized.startsWith('select id, user_id, token_hash, expires_at, used from email_verification_tokens where id = $1')) {
      const [id] = params;
      const record = this.emailVerificationTokens.find((token) => token.id === id);
      return { rowCount: record ? 1 : 0, rows: record ? [record] : [] };
    }

    if (normalized.startsWith('update email_verification_tokens set used = true, used_at = $2 where id = $1')) {
      const [id, usedAt] = params;
      const record = this.emailVerificationTokens.find((token) => token.id === id);
      if (record) {
        record.used = true;
        record.used_at = usedAt instanceof Date ? new Date(usedAt) : usedAt;
        return { rowCount: 1, rows: [] };
      }
      return { rowCount: 0, rows: [] };
    }

    if (normalized.startsWith('update invitations set used = true, used_at = $2, status = $3 where email = $1 and status = $4 and used = false')) {
      const [email, usedAt, status] = params;
      let count = 0;
      this.invitations.forEach((invitation) => {
        if (invitation.email === email && invitation.status === 'pending' && !invitation.used) {
          invitation.used = true;
          invitation.used_at = usedAt instanceof Date ? new Date(usedAt) : usedAt;
          invitation.status = status;
          count += 1;
        }
      });
      return { rowCount: count, rows: [] };
    }

    if (normalized.startsWith('insert into invitations')) {
      const [email, firstName, lastName, invitedBy, tokenHash, expiresAt, status] = params;
      const record = {
        id: this._counters.invitation++,
        email,
        first_name: firstName,
        last_name: lastName,
        invited_by: invitedBy,
        token_hash: tokenHash,
        expires_at: expiresAt instanceof Date ? new Date(expiresAt) : expiresAt,
        status,
        used: false,
        created_at: new Date(),
      };
      this.invitations.push(record);
      return {
        rowCount: 1,
        rows: [
          {
            id: record.id,
            email: record.email,
            first_name: record.first_name,
            last_name: record.last_name,
            status: record.status,
            expires_at: record.expires_at,
            created_at: record.created_at,
            invited_by: record.invited_by,
          },
        ],
      };
    }

    if (normalized.startsWith('select id, email, first_name, last_name, token_hash, expires_at, used, status from invitations where id = $1')) {
      const [id] = params;
      const record = this.invitations.find((invitation) => invitation.id === id);
      return { rowCount: record ? 1 : 0, rows: record ? [record] : [] };
    }

    if (normalized.startsWith('delete from invitations where email = $1 and status = $2')) {
      const [email, status] = params;
      const before = this.invitations.length;
      this.invitations = this.invitations.filter(
        (invitation) => !(invitation.email === email && invitation.status === status)
      );
      return { rowCount: before - this.invitations.length, rows: [] };
    }

    if (normalized.startsWith('update invitations set used = true, used_at = $2, status = $3 where id = $1')) {
      const [id, usedAt, status] = params;
      const record = this.invitations.find((invitation) => invitation.id === id);
      if (record) {
        record.used = true;
        record.used_at = usedAt instanceof Date ? new Date(usedAt) : usedAt;
        record.status = status;
        return { rowCount: 1, rows: [] };
      }
      return { rowCount: 0, rows: [] };
    }

    if (normalized.startsWith('select is_admin from users where id = $1')) {
      const [id] = params;
      const user = this.users.get(id);
      if (!user) {
        return { rowCount: 0, rows: [] };
      }
      return { rowCount: 1, rows: [{ is_admin: user.is_admin }] };
    }

    if (normalized.startsWith('select role from users where id = $1')) {
      const [id] = params;
      const user = this.users.get(id);
      if (!user) {
        return { rowCount: 0, rows: [] };
      }
      return { rowCount: 1, rows: [{ role: user.role ?? (user.is_admin ? 'admin' : 'user') }] };
    }

    if (normalized.startsWith('insert into outbound_emails')) {
      const [recipient, subject, body] = params;
      this.emailLog.push({ recipient, subject, body });
      return { rowCount: 1, rows: [] };
    }

    throw new Error(`Unsupported query: ${sql}`);
  }
}

const oneHourMs = 60 * 60 * 1000;
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

test('createPasswordResetToken stores hashed token with one-hour expiry', async () => {
  const pool = new FakePool();
  const now = new Date('2024-01-01T00:00:00Z');

  const result = await createPasswordResetToken(pool, 1, { now });

  assert.ok(result.token.includes(':'), 'Token should contain separator');
  assert.equal(pool.passwordResetTokens.length, 1);
  const stored = pool.passwordResetTokens[0];
  assert.equal(stored.user_id, 1);
  assert.equal(stored.used, false);
  assert.equal(stored.expires_at.getTime() - now.getTime(), oneHourMs);
});

test('createInvitation assigns a seven day expiration window', async () => {
  const pool = new FakePool();
  const now = new Date('2024-05-05T12:00:00Z');

  const { invitation, token } = await createInvitation(
    pool,
    {
      email: 'invitee@example.com',
      firstName: 'Invited',
      lastName: 'Person',
      invitedBy: 42,
    },
    { now }
  );

  assert.ok(token.includes(':'), 'Invitation token should include separator');
  assert.equal(invitation.email, 'invitee@example.com');
  assert.equal(pool.invitations.length, 1);
  const stored = pool.invitations[0];
  assert.equal(stored.status, 'pending');
  assert.equal(stored.expires_at.getTime() - now.getTime(), sevenDaysMs);
});

test('validateEmailVerificationToken rejects expired tokens', async () => {
  const pool = new FakePool();
  const now = new Date('2024-04-01T00:00:00Z');

  pool.emailVerificationTokens.push({
    id: 1,
    user_id: 10,
    token_hash: 'secret-token',
    expires_at: new Date(now.getTime() - 1000),
    used: false,
  });

  await assert.rejects(
    () =>
      validateEmailVerificationToken(pool, '1:secret-token', {
        now,
        compareToken: (raw, hash) => raw === hash,
      }),
    (error) => error instanceof TokenError && error.code === 'TOKEN_EXPIRED'
  );
});

test('admin middleware blocks non-admin users', async () => {
  const pool = new FakePool();
  pool.addUser({ id: 5, is_admin: false });

  const middleware = createAdminMiddleware(pool);

  const req = { user: { id: 5 } };
  const res = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  await middleware(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.ok(res.payload?.error?.includes('Admin'));
});
