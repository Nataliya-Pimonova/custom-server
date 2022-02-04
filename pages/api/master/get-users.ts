import { query } from '../../../lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function ip(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const results = await query(`
          SELECT * FROM users
          ORDER BY createdAt DESC          
      `);

        return res.json(results);
        //console.log(res.ip);
      }

      default:
        res.status(405).json({
          error: { message: 'Method not allowed.' },
        });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: { message: `An error ocurred, ${err}` },
    });
  }
}
