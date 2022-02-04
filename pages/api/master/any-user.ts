import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';

export default async function ip(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: '`id` required' });
    }
    if (isNaN(parseInt(id.toString(), 10))) {
      return res.status(400).json({ message: '`id` must be a number' });
    }
    switch (req.method) {
      case 'GET': {
        const results = await query(
          `
            SELECT *
            FROM users
            WHERE id = ?
          `,
          id
        );
        if (!results[0]) {
          return res.status(404).json({ message: 'У нас нет такой страницы!' });
        }
        return res.json(results[0]);
      }
      case 'PATCH': {
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({
            message: '`name` is required',
          });
        }
        const results = await query(
          `
            UPDATE users
            SET name = ?
            WHERE id = ?
            `,
          [name, id]
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
            DELETE FROM users
            WHERE id = ?
        `,
          id
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
