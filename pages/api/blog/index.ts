import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';

export default async function ip(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const results = await query(`
        SELECT * FROM posts
        ORDER BY post_id DESC
      
    `);

        return res.json(results);
      }
      case 'POST': {
        const { title, text, category } = req.body;
        if (!title || !text || !category) {
          return res
            .status(400)
            .json({ message: '`title`, `category` and `text` are required' });
        }

        const results = await query(
          `
            INSERT INTO posts (post_title, post_text, post_category)
            VALUES (?, ?, ?)
            `,
          [title, text, category]
        );

        return res.json(results);
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
