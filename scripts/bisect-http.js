const express = require('/app/node_modules/express');

async function probe(name, build) {
  const app = express();
  build(app);
  app.get('/probe', (req, res) => res.send('OK:' + name));
  const srv = app.listen(0, '127.0.0.1');
  await new Promise((r) => srv.on('listening', r));
  const port = srv.address().port;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`http://127.0.0.1:${port}/probe`, { signal: controller.signal });
    const body = await res.text();
    console.log(`${name.padEnd(16)} -> ${res.status} ${body.slice(0, 40)}`);
  } catch (e) {
    console.log(`${name.padEnd(16)} -> HANG (${e.name})`);
  } finally {
    clearTimeout(timer);
    srv.close();
  }
}

(async () => {
  await probe('express', () => {});
  await probe('urlencoded', (app) => app.use(express.urlencoded({ extended: true, limit: '256kb' })));
  await probe('json', (app) => app.use(express.json({ limit: '256kb' })));
  await probe('metrics', (app) => app.use(require('/app/src/middleware/metrics').trackRequest));
  await probe('cookie-session', (app) =>
    app.use(
      require('/app/node_modules/cookie-session')({
        name: 'kho.sid',
        keys: ['test'],
        maxAge: 3600000,
        httpOnly: true,
        sameSite: 'lax'
      })
    )
  );
  await probe('flash', (app) => app.use(require('/app/src/middleware/flash')));
  await probe('attachUser', (app) => app.use(require('/app/src/middleware/auth').attachUser));
  await probe('static', (app) => app.use('/static', express.static('/app/public', { maxAge: 0 })));
  await probe('full-app', (app) => app.use(require('/app/src/app')));
  process.exit(0);
})();
