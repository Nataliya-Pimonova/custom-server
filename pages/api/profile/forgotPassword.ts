import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import createToken from '@/lib/createToken';
import { sendConfirmEmail } from '@/lib/email';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { username } = req.query;
  try {
    switch (req.method) {
      case 'PATCH': {
        if (!username) {
          return res.status(400).json({ message: '`username` required' });
        }
        const { baseToken, token, tokenExpires } = createToken(120);
        let results = await db
          .transaction()
          .query('SELECT username, name FROM users WHERE username = ?', [
            username,
          ])
          .query((r) => {
            if (r) {
              sendConfirmEmail(username, baseToken, 'Confirm password reset');
              return [
                'UPDATE users SET token = ?, tokenExpires = ? WHERE username = ?',
                [token, tokenExpires, username],
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
