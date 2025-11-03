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
  
  try {
    // Lösche alte ausstehende Einladungen für diese E-Mail, um UNIQUE Constraint (email, status) zu erfüllen
    // und um sicherzustellen, dass nur eine aktive Einladung pro E-Mail existiert
    await pool.query(
      'DELETE FROM invitations WHERE email = $1 AND status = $2 AND used = false',
      [payload.email, 'pending']
    );

    const rawToken = options.generateToken ? options.generateToken() : generateRawToken();
    const tokenHash = await (options.hashToken ? options.hashToken(rawToken) : defaultHash(rawToken));
    const expiresAt = new Date(now.getTime() + INVITATION_TOKEN_TTL);

    // Stelle sicher, dass first_name und last_name nicht null sind (leerer String ist erlaubt)
    const firstName = payload.firstName || '';
    const lastName = payload.lastName || '';

    // Erstelle einen kurzen Einladungscode (max 50 Zeichen) für die Anzeige
    // Verwende nur die ersten 45 Zeichen des rawTokens als Code
    const shortCode = rawToken.substring(0, 45);

    const { rows } = await pool.query(
      'INSERT INTO invitations (email, first_name, last_name, invited_by, token_hash, expires_at, status, used, invitation_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, first_name, last_name, status, expires_at, created_at, invited_by, used, used_at',
      [payload.email, firstName, lastName, payload.invitedBy ?? null, tokenHash, expiresAt, 'pending', false, shortCode]
    );

    if (!rows || rows.length === 0) {
      throw new InvitationError('INVITATION_CREATE_FAILED', 'Einladung konnte nicht erstellt werden.');
    }

    const invitation = rows[0];
    // Erstelle den finalen Token mit der tatsächlichen Invitation ID
    const finalToken = createCompositeToken(invitation.id, rawToken);
    
    return {
      invitation: { ...invitation, invitation_code: shortCode },
      token: finalToken,
    };
  } catch (error) {
    if (error instanceof InvitationError) {
      throw error;
    }
    // Wrappe Datenbankfehler in InvitationError
    throw new InvitationError('DATABASE_ERROR', `Datenbankfehler: ${error.message}`);
  }
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
