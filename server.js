const express = require('express');
const next = require('next');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.enable('trust proxy');

  server.use(cors());
  server.use(helmet());
  server.post(
    '/webhook-checkout',
    bodyParser.raw({ type: 'application/json' })
  );
  server.use(express.json({ limit: '10kb' }));
  server.use(express.urlencoded({ extended: true, limit: '10kb' }));
  server.use(cookieParser());
  server.use(xss());
  server.use(
    hpp({
      whitelist: ['category', 'product', 'price'],
    })
  );

  server.use(compression());

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
