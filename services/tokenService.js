import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const TOKEN_SALT_ROUNDS = 10;
export const PASSWORD_RESET_TOKEN_TTL = 60 * 60 * 1000; // 1 hour in ms
export const EMAIL_VERIFICATION_TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

const TOKEN_SEPARATOR = ':';

export class TokenError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'TokenError';
    this.code = code;
  }
}

export const generateRawToken = () => crypto.randomBytes(32).toString('hex');

export const createCompositeToken = (id, rawToken) => `${id}${TOKEN_SEPARATOR}${rawToken}`;

export const parseCompositeToken = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }
  const parts = token.split(TOKEN_SEPARATOR);
  if (parts.length !== 2) {
    return null;
  }
  const id = Number.parseInt(parts[0], 10);
  if (Number.isNaN(id) || !parts[1]) {
    return null;
  }
  return { id, rawToken: parts[1] };
};

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

export const createPasswordResetToken = async (pool, userId, options = {}) => {
  const now = resolveNow(options);
  await pool.query(
    'UPDATE password_reset_tokens SET used = true, used_at = $2 WHERE user_id = $1 AND used = false',
    [userId, now]
  );

  const rawToken = options.generateToken ? options.generateToken() : generateRawToken();
  const tokenHash = await (options.hashToken ? options.hashToken(rawToken) : defaultHash(rawToken));
  const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL);

  const { rows } = await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id, expires_at',
    [userId, tokenHash, expiresAt]
  );

  const record = rows[0];
  return {
    token: createCompositeToken(record.id, rawToken),
    expiresAt: record.expires_at ?? expiresAt,
  };
};

export const validatePasswordResetToken = async (pool, compositeToken, options = {}) => {
  const now = resolveNow(options);
  const parsed = parseCompositeToken(compositeToken);
  if (!parsed) {
    throw new TokenError('TOKEN_INVALID', 'Ungültiger oder fehlender Token.');
  }

  const { rows } = await pool.query(
    'SELECT id, user_id, token_hash, expires_at, used FROM password_reset_tokens WHERE id = $1',
    [parsed.id]
  );

  if (rows.length === 0) {
    throw new TokenError('TOKEN_INVALID', 'Token existiert nicht.');
  }

  const token = rows[0];
  if (token.used) {
    throw new TokenError('TOKEN_USED', 'Token wurde bereits verwendet.');
  }

  if (new Date(token.expires_at) <= now) {
    throw new TokenError('TOKEN_EXPIRED', 'Token ist abgelaufen.');
  }

  const isMatch = await (options.compareToken
    ? options.compareToken(parsed.rawToken, token.token_hash)
    : defaultCompare(parsed.rawToken, token.token_hash));

  if (!isMatch) {
    throw new TokenError('TOKEN_INVALID', 'Token ist ungültig.');
  }

  return { id: token.id, userId: token.user_id };
};

export const markPasswordResetTokenUsed = async (pool, tokenId, options = {}) => {
  const now = resolveNow(options);
  await pool.query('UPDATE password_reset_tokens SET used = true, used_at = $2 WHERE id = $1', [tokenId, now]);
};

export const createEmailVerificationToken = async (pool, userId, options = {}) => {
  const now = resolveNow(options);
  await pool.query(
    'UPDATE email_verification_tokens SET used = true, used_at = $2 WHERE user_id = $1 AND used = false',
    [userId, now]
  );

  const rawToken = options.generateToken ? options.generateToken() : generateRawToken();
  const tokenHash = await (options.hashToken ? options.hashToken(rawToken) : defaultHash(rawToken));
  const expiresAt = new Date(now.getTime() + EMAIL_VERIFICATION_TOKEN_TTL);

  const { rows } = await pool.query(
    'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id, expires_at',
    [userId, tokenHash, expiresAt]
  );

  const record = rows[0];
  return {
    token: createCompositeToken(record.id, rawToken),
    expiresAt: record.expires_at ?? expiresAt,
  };
};

export const validateEmailVerificationToken = async (pool, compositeToken, options = {}) => {
  const now = resolveNow(options);
  const parsed = parseCompositeToken(compositeToken);
  if (!parsed) {
    throw new TokenError('TOKEN_INVALID', 'Ungültiger oder fehlender Token.');
  }

  const { rows } = await pool.query(
    'SELECT id, user_id, token_hash, expires_at, used FROM email_verification_tokens WHERE id = $1',
    [parsed.id]
  );

  if (rows.length === 0) {
    throw new TokenError('TOKEN_INVALID', 'Token existiert nicht.');
  }

  const token = rows[0];
  if (token.used) {
    throw new TokenError('TOKEN_USED', 'Token wurde bereits verwendet.');
  }

  if (new Date(token.expires_at) <= now) {
    throw new TokenError('TOKEN_EXPIRED', 'Token ist abgelaufen.');
  }

  const isMatch = await (options.compareToken
    ? options.compareToken(parsed.rawToken, token.token_hash)
    : defaultCompare(parsed.rawToken, token.token_hash));

  if (!isMatch) {
    throw new TokenError('TOKEN_INVALID', 'Token ist ungültig.');
  }

  return { id: token.id, userId: token.user_id };
};

export const markEmailVerificationTokenUsed = async (pool, tokenId, options = {}) => {
  const now = resolveNow(options);
  await pool.query('UPDATE email_verification_tokens SET used = true, used_at = $2 WHERE id = $1', [tokenId, now]);
};
