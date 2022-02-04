import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from './../../../lib/db';
import createToken, { createSaltHash } from './../../../lib/createToken';
import { sendConfirmEmail } from './../../../lib/email';

export default async function createUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username, password } = req.body;

  try {
    switch (req.method) {
      case 'POST': {
        if (!username || !password) {
          return res
            .status(400)
            .json({ message: '`username` and `password` are both required' });
        }
        const { salt, hash } = createSaltHash(password);

        const id = uuidv4();
        const createdAt = Date.now();
        const { baseToken, token, tokenExpires } = createToken(120);

        const userIP = req.socket.remoteAddress;
        try {
          let user = await db
            .transaction()
            .query(
              `
          INSERT INTO users (id, createdAt, username, hash, salt, token, tokenExpires)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
              [id, createdAt, username, hash, salt, token, tokenExpires]
            )
            .query((r) => {
              if (r) {
                return [
                  'INSERT INTO user_ids (username, ip) VALUES (?, ?)',
                  [username, userIP],
                ];
              } else {
                return null;
              }
            })
            .rollback((e) => {
              return res.status(400).json({
                message: e,
                //'Ваша ссылка неверна или время ее действия истекло!',
              });
              /* do something with the error */
            }) // optional
            .commit(); // execute the queries
          sendConfirmEmail(username, baseToken, 'Confirm your email');

          return res.status(200).json(user);
        } catch (er) {
          console.log(er);
        }
      }
      default:
        res.status(405).json({
          error: { message: 'Method not allowed.' },
        });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
