import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import createToken, { createSaltHash } from '@/lib/createToken';
import { sendConfirmEmail } from '@/lib/email';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case 'PATCH': {
        const { username, password, token } = req.body;
        if (!username || !password || !token) {
          return res.status(400).json({ message: '`username` required' });
        }

        const { salt, hash } = createSaltHash(password);

        let results = await db
          .transaction()
          .query(
            'SELECT username, name FROM users WHERE token = ? AND tokenExpires >= ?',
            [token, Date.now()]
          )
          .query((r) => {
            if (r) {
              return [
                'UPDATE users SET token = 0, tokenExpires = 0, salt = ?, hash = ? WHERE username = ?',
                [salt, hash, username],
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

        return res.json(results);
      }
      default:
        res.status(405).json({
          error: { message: 'Method not allowed.' },
        });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
