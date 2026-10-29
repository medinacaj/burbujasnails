import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

function ignored(path) {
  const res = spawnSync('git', ['check-ignore', '--no-index', '-q', path], {
    cwd: root, encoding: 'utf8',
  });
  assert.ok([0, 1].includes(res.status), 'git check-ignore no pudo ejecutarse');
  return res.status === 0;
}

for (const path of [
  '.env', '.env.production', '.env.local',
  'private/server.pem', 'secret.key', 'local/secrets.p12',
  'id_rsa', 'credentials.json', 'server/service-account.json',
  'backup.sqlite3', 'salon.db', 'data.backup', 'server.log',
  'node_modules/module/index.js', '.vercel/project.json', '.next/cache/files',
]) {
  assert.equal(ignored(path), true, 'La regla debe proteger: ' + path);
}
for (const path of [
  '.env.example', '.env.sample', '.env.template',
  'index.html', 'styles.css', 'app.js', 'data.js',
  'gallery/imagen.webp', 'robots.txt', 'sitemap.xml',
]) {
  assert.equal(ignored(path), false, 'No ocultar archivo publicable: ' + path);
}
console.log('Ignorados de seguridad: archivos sensibles protegidos y sitio publicable preservado');
