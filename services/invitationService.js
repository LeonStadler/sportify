import bcrypt from 'bcryptjs';
import {
  TOKEN_SALT_ROUNDS,
  generateRawToken,
  createCompositeToken,
  parseCompositeToken,
} from './tokenService.js';

export const INVITATION_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export class InvitationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'InvitationError';
    this.code = code;
  }
}

const defaultHash = (value) => bcrypt.hash(value, TOKEN_SALT_ROUNDS);
const defaultCompare = (value, hash) => bcrypt.compare(value, hash);

const resolveNow = (options) => {
  if (!options) {
    return new Date();
  }
  if (options.now instanceof Date) {
    return options.now;
  }
  if (typeof options.now === 'function') {
    return options.now();
  }
  return new Date();
};

export const createInvitation = async (pool, payload, options = {}) => {
  const now = resolveNow(options);
  await pool.query(
    'UPDATE invitations SET used = true, used_at = $2, status = $3 WHERE email = $1 AND status = $4 AND used = false',
    [payload.email, now, 'cancelled', 'pending']
  );

  const rawToken = options.generateToken ? options.generateToken() : generateRawToken();
  const tokenHash = await (options.hashToken ? options.hashToken(rawToken) : defaultHash(rawToken));
  const expiresAt = new Date(now.getTime() + INVITATION_TOKEN_TTL);

  const { rows } = await pool.query(
    'INSERT INTO invitations (email, first_name, last_name, invited_by, token_hash, expires_at, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, first_name, last_name, status, expires_at, created_at, invited_by',
    [payload.email, payload.firstName, payload.lastName, payload.invitedBy ?? null, tokenHash, expiresAt, 'pending']
  );

  const invitation = rows[0];
  return {
    invitation,
    token: createCompositeToken(invitation.id, rawToken),
  };
};

export const validateInvitationToken = async (pool, compositeToken, options = {}) => {
  const now = resolveNow(options);
  const parsed = parseCompositeToken(compositeToken);
  if (!parsed) {
    throw new InvitationError('TOKEN_INVALID', 'Ungültiger oder fehlender Token.');
  }

  const { rows } = await pool.query(
    'SELECT id, email, first_name, last_name, token_hash, expires_at, used, status FROM invitations WHERE id = $1',
    [parsed.id]
  );

  if (rows.length === 0) {
    throw new InvitationError('TOKEN_INVALID', 'Token existiert nicht.');
  }

  const invitation = rows[0];
  if (invitation.used || invitation.status !== 'pending') {
    throw new InvitationError('TOKEN_USED', 'Einladung wurde bereits verwendet.');
  }

  if (new Date(invitation.expires_at) <= now) {
    throw new InvitationError('TOKEN_EXPIRED', 'Einladung ist abgelaufen.');
  }

  const isMatch = await (options.compareToken
    ? options.compareToken(parsed.rawToken, invitation.token_hash)
    : defaultCompare(parsed.rawToken, invitation.token_hash));

  if (!isMatch) {
    throw new InvitationError('TOKEN_INVALID', 'Einladungs-Token ist ungültig.');
  }

  return {
    id: invitation.id,
    email: invitation.email,
  };
};

export const markInvitationUsed = async (pool, tokenId, options = {}) => {
  const now = resolveNow(options);
  await pool.query('UPDATE invitations SET used = true, used_at = $2, status = $3 WHERE id = $1', [
    tokenId,
    now,
    'accepted',
  ]);
};
