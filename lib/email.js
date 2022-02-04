import nodemailer from 'nodemailer';
const htmlToText = require('nodemailer-html-to-text').htmlToText;
//import createToken from './../lib/createToken';

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME, // generated ethereal user
    pass: process.env.EMAIL_PASSWORD, // generated ethereal password
  },
});
transporter.use('compile', htmlToText());

export default transporter;

export async function sendConfirmEmail(username, baseToken, subject) {
  const confirmEmailUrl = `${process.env.HOST}/api/recive-token?token=${baseToken}&username=${username}`;

  let info = await transporter.sendMail({
    from: '"Natalya 🦸‍♀️" <hi@planburg.com>', // sender address
    to: username, // list of receivers
    subject: subject, // Subject line
    html: `<b>Hi, here is your confirm link: ${confirmEmailUrl}</b>`, // html body
  });

  console.log('Message sent: %s', info.messageId);
}

export async function sendNewIpEmail(username, ip) {
  let info = await transporter.sendMail({
    from: '"Natalya 🦸‍♀️" <hi@planburg.com>', // sender address
    to: username, // list of receivers
    subject: 'Login from unknown device', // Subject line
    html: `<b>Hi, someone just login to your account on unknown device. If it was you, ignore this letter. If not - tab this button ${process.env.HOST}/api/notMineIp/${ip} And then change your password</b>`, // html body
  });

  console.log('Message sent: %s', info.messageId);
}
