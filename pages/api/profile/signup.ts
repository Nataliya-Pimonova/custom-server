import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from './../../../lib/db';
import createToken from './../../../lib/createToken';
//import transporterimport { sendConfirmEmail } from '@/lib/email';
import { sendConfirmEmail } from './../../../lib/email';

export default async function createUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username, password } = req.body;

  try {
    switch (req.method) {
      case 'POST': {
        if (!username || !password) {
          return res
            .status(400)
            .json({ message: '`username` and `password` are both required' });
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto
          .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
          .toString('hex');
        const id = uuidv4();
        const createdAt = Date.now();
        const { baseToken, token, tokenExpires } = createToken(120);

        console.log(token);

        const user = await query(
          `
        INSERT INTO users (id, createdAt, username, hash, salt, token, tokenExpires)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [id, createdAt, username, hash, salt, token, tokenExpires]
        );
        sendConfirmEmail(username, baseToken);
        // const confirmEmailUrl = `${process.env.HOST}/api/recive-token?token=${token}`;

        // let info = await transporter.sendMail({
        //   from: '"Natalya 🦸‍♀️" <hi@planburg.com>', // sender address
        //   to: username, // list of receivers
        //   subject: 'Confirm your email', // Subject line
        //   html: `<b>Hi, here is your confirm link: ${confirmEmailUrl}</b>`, // html body
        // });

        // console.log('Message sent: %s', info.messageId);

        return res.status(200).json(user);
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
