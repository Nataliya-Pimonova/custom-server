import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { query, db } from '@/lib/db';
//import createToken from '@/lib/createToken';
//import mysql from 'serverless-mysql';

export default async function confirmEmail(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'PATCH': {
        const { token, username } = req.query;
        if (!token) {
          return res.status(400).json({ message: '`token` required' });
        }
        if (typeof token.toString() !== 'string') {
          return res.status(400).json({ message: '`token` must be a string' });
        }
        const hashedToken = crypto
          .createHash('sha256')
          .update(token.toString())
          .digest('hex');
        console.log(hashedToken);
        console.log(token);

        let results = await db
          .transaction()
          .query(
            'SELECT username, emailConfirmed FROM users WHERE token = ? AND tokenExpires >= ?',
            [hashedToken, Date.now()]
          )
          .query((r) => {
            if (r) {
              return [
                'UPDATE users SET emailConfirmed = 1, newsletters = 1, token = 0, tokenExpires = 0 WHERE username = ?',
                [username],
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
      // case 'PATCH': {
      //   const { username } = req.body;
      //   if (!username) {
      //     return res.status(400).json({ message: '`token` required' });
      //   }
      //   const results = await query(
      //     `
      //       UPDATE users
      //       SET emailConfirmed = 1, newsletters = 1, token = 0, tokenExpires = 0
      //       WHERE username = ?
      //     `,
      //     username
      //   );

      //   return res.json(results[0]);
      // }
      default:
        res.status(405).json({
          error: { message: 'Method not allowed.' },
        });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
