import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from './db';
import createToken from './../lib/createToken';
import transporter, { sendConfirmEmail } from './email';
//import Error from './../_error';
import Error from 'next/error';

// export async function createUser(req: NextApiRequest, res: NextApiResponse) {
//   const { username, password } = req.body;

//   try {
//     switch (req.method) {
//       case 'POST': {
//         if (!username || !password) {
//           return res
//             .status(400)
//             .json({ message: '`username` and `password` are both required' });
//         }
//         const salt = crypto.randomBytes(16).toString('hex');
//         const hash = crypto
//           .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
//           .toString('hex');
//         const id = uuidv4();
//         const createdAt = Date.now();
//         const { baseToken, token, tokenExpires } = createToken(20);

//         const user = await query(
//           `
//         INSERT INTO users (id, createdAt, username, hash, salt, token, tokenExpires)
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//         `,
//           [id, createdAt, username, hash, salt, token, tokenExpires]
//         );

//         sendConfirmEmail(username, baseToken);

//         return user;
//       }
//       default:
//         res.status(405).json({
//           error: { message: 'Method not allowed.' },
//         });
//     }
//   } catch (e) {
//     res.status(500).json({ message: e.message });
//   }
// }

export async function findUser({ username }) {
  try {
    const user = await query(
      `
      SELECT *
      FROM users
      WHERE username = ?
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
