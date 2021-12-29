import { NextApiHandler } from 'next';
import { query } from '../../../lib/db';

const handler: NextApiHandler = async (req, res) => {
  const { title, text, category } = req.body;
  try {
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
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
