'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if (typeof PhusionPassenger !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  if (typeof PhusionPassenger !== 'undefined') {
    server.listen('passenger');
    return;
  }

  const port = Number(process.env.PORT || 3000);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Ready on http://127.0.0.1:${port}`);
  });
});
