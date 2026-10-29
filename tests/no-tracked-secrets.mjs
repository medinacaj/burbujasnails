// Impide que un git add -f accidental publique archivos privados en el repositorio.
// Solo revisa NOMBRES versionados; no lee ni imprime el contenido de archivos.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

export function sensitiveTrackedPath(filename) {
  const segments = String(filename).replaceAll('\\', '/').split('/');
  const name = segments.at(-1).toLowerCase();
  if (name === '.env' || (name.startsWith('.env.') &&
      !['.env.example', '.env.sample', '.env.template'].includes(name))) return true;
  if (['.npmrc', '.pypirc', 'id_rsa', 'id_dsa', 'id_ed25519',
       'credentials.json', 'service-account.json', 'service_account.json'].includes(name)) return true;
  if (/\.(?:pem|p12|pfx|key|keystore|sqlite|sqlite3|db|bak|backup)$/.test(name)) return true;
  return segments.some(part => part === '.vercel' || part === '.next' || part === 'node_modules');
}

for (const path of [
  '.env', 'config/.env.production', 'secrets/private.key', 'credentials.json',
  'local.sqlite3', 'backup/2026-10-25.bak', '.vercel/project.json',
  'node_modules/package/index.js', 'keys/id_ed25519',
]) assert.equal(sensitiveTrackedPath(path), true, 'Debe bloquear: ' + path);

for (const path of [
  '.env.example', '.env.sample', '.env.template', 'gallery/image.webp',
  'index.html', 'data.js', 'db/schema.sql', 'tests/security.mjs', 'README.md',
]) assert.equal(sensitiveTrackedPath(path), false, 'No debe bloquear: ' + path);

const tracked = execFileSync('git', ['ls-files', '--cached', '-z'], {
  encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
}).split('\0').filter(Boolean);
const flagged = tracked.filter(sensitiveTrackedPath);
assert.equal(flagged.length, 0,
  'El repositorio tiene ' + flagged.length + ' nombres de archivos con patrón sensible versionados. Revisar localmente git ls-files sin exponer contenidos en logs.');
console.log('Control de archivos privados versionados: aprobado. ' + tracked.length + ' rutas revisadas.');
