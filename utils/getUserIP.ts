export default function getUserIP(req) {
  const userIP = req.headers['x-forwarded-for'];
  return userIP ? userIP.split(',')[0] : req.socket.remoteAddress;
}
