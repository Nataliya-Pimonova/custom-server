import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';

export default async function ip(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { post_id } = req.query;
    if (!post_id) {
      return res.status(400).json({ message: '`id` required' });
    }
    if (isNaN(parseInt(post_id.toString(), 10))) {
      return res.status(400).json({ message: '`id` must be a number' });
    }
    switch (req.method) {
      case 'GET': {
        const results = await query(
          `
            SELECT *
            FROM posts
            WHERE post_id = ?
          `,
          post_id
        );
        if (!results[0]) {
          return res.status(404).json({ message: 'У нас нет такой страницы!' });
        }
        return res.json(results[0]);
      }
      case 'PATCH': {
        const { title, text, category } = req.body;
        if (!title || !text || !category) {
          return res.status(400).json({
            message: '`id`,`title`, `category` and `text` are all required',
          });
        }
        const results = await query(
          `
            UPDATE posts
            SET post_title = ?, post_text = ?, post_category = ?
            WHERE post_id = ?
            `,
          [title, text, category, post_id]
        );
        if (results.affectedRows === 0) {
          return res
            .status(404)
            .json({ message: 'У нас нет такого документа!' });
        }

        return res.json(results);
      }
      case 'DELETE': {
        const results = await query(
          `
            DELETE FROM posts
            WHERE post_id = ?
        `,
          post_id
        );
        if (results.affectedRows === 0) {
          return res
            .status(404)
            .json({ message: 'У нас нет такого документа!' });
        }
        res.json(results);
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
