export const queueEmail = async (pool, { recipient, subject, body }) => {
  if (!recipient || !subject || !body) {
    throw new Error('E-Mail-Angaben sind unvollständig.');
  }

  await pool.query(
    'INSERT INTO outbound_emails (recipient, subject, body) VALUES ($1, $2, $3)',
    [recipient, subject, body]
  );
};
