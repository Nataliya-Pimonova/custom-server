import passport from 'passport';
import nextConnect from 'next-connect';
import Local from 'passport-local';
import { setLoginSession } from '../../../lib/auth';
import { findUser, validatePassword } from '../../../lib/user';
import { sendNewIpEmail } from '@/lib/email';
import { db } from './../../../lib/db';
//import Error from 'next/error';

const authenticate = (method, req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate(method, { session: false }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    })(req, res);
  });

export const localStrategy = new Local.Strategy(function (
  username,
  password,
  done
) {
  findUser({ username })
    .then((user) => {
      if (user && validatePassword(user, password)) {
        done(null, user);
      } else {
        done(new Error('Invalid username and password combination'));
      }
    })
    .catch((error) => {
      done(error);
    });
});

passport.use(localStrategy);

let userIP = '';

export default nextConnect()
  .use(passport.initialize())
  .post(async (req, res) => {
    userIP = req.socket.remoteAddress;
    try {
      const user = await authenticate('local', req, res);
      // session is the payload to save in the token, it may contain basic info about the user
      const session = { ...user };
      console.log(user);
      setLoginSession(res, session);

      if (userIP !== user.ip) {
        await db.query(
          `
        INSERT INTO user_ids (username, ip) VALUES (?, ?)',
        [username, userIP],
      `,
          [user.username, user.ip]
        );
        await sendNewIpEmail(session.username, session.ip);
      } else res.status(200).send({ done: true });
    } catch (error) {
      console.error(error);
      res.status(401).send(error.message);
    }
  });
