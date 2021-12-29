import crypto from 'crypto';

export default function createToken(minutes) {
  const baseToken = crypto.randomBytes(16).toString('hex');
  const token = crypto.createHash('sha256').update(baseToken).digest('hex');
  const tokenExpires = Date.now() + minutes * 60 * 1000;
  return { baseToken, token, tokenExpires };
}
