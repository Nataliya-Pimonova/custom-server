import crypto from 'crypto';
import { query } from './db';

export async function findUser({ username }) {
  try {
    const user = await query(
      `
      SELECT users.*, user_ids.ip
      FROM  users INNER JOIN user_ids ON users.username=user_ids.username
      WHERE users.username = ?
    `,
      username
    );

    //console.log(user[0]);
    return user[0];
  } catch (e) {
    console.log(e);
  }
}

// Compare the password of an already fetched user (using `findUser`) and compare the
// password for a potential match
export function validatePassword(user, inputPassword) {
  const inputHash = crypto
    .pbkdf2Sync(inputPassword, user.salt, 1000, 64, 'sha512')
    .toString('hex');
  const passwordsMatch = user.hash === inputHash;
  return passwordsMatch;
}

export function isAdmin(role) {}
