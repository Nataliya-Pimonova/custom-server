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
      case 'DELETE': {
        const { ip, username } = req.query;
        if (!ip) {
          return res.status(400).json({ message: '`ip` required' });
        }
        if (typeof ip !== 'string') {
          return res.status(400).json({ message: '`ip` must be a string' });
        }
        try {
          let results = await db.query(
            'DELETE * FROM user_ids WHERE username = ? AND ip = ?',
            [username, ip]
          );

          return res.status(204).json(results);
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
