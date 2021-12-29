import { NextApiHandler } from 'next';
import { query } from '../../../lib/db';

const handler: NextApiHandler = async (req, res) => {
  const { id, title, text, category } = req.body;
  try {
    if (!id || !title || !text || !category) {
      return res.status(400).json({
        message: '`id`,`title`, `category` and `text` are all required',
      });
    }
    if (isNaN(parseInt(id.toString(), 10))) {
      return res.status(400).json({ message: '`id` must be a number' });
    }

    const results = await query(
      `
      UPDATE posts
      SET post_title = ?, post_text = ?, post_category = ?
      WHERE post_id = ?
      `,
      [title, text, category, id]
    );
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'У нас нет такого документа!' });
    }

    return res.json(results);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
