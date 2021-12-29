import { NextApiHandler } from 'next';
import { query } from '../../../lib/db';

const handler: NextApiHandler = async (req, res) => {
  const { post_id } = req.query;
  try {
    if (!post_id) {
      return res.status(400).json({ message: '`id` required' });
    }
    if (isNaN(parseInt(post_id.toString(), 10))) {
      return res.status(400).json({ message: '`id` must be a number' });
    }
    const results = await query(
      `
      DELETE FROM posts
      WHERE post_id = ?
  `,
      post_id
    );
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'У нас нет такого документа!' });
    }
    res.json(results);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
