// Revisa SOLO el contenido textual versionado en HEAD; nunca imprime valores.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,statSync} from 'node:fs';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const tracked=execFileSync('git',['ls-files','--cached','-z'],{
  cwd:root,encoding:'utf8',maxBuffer:8*1024*1024
}).split('\0').filter(Boolean);
const textExtensions=new Set([
  '.js','.mjs','.cjs','.ts','.tsx','.jsx','.css','.html','.md',
  '.yml','.yaml','.json','.sql','.txt','.sh','.svg','.xml','.toml'
]);
const textNames=new Set(['.gitignore','CNAME','LICENSE','Makefile']);
const checks=[
  {kind:'clave privada PEM',re:/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/},
  {kind:'GitHub token',re:/(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}(?![A-Za-z0-9])/},
  {kind:'GitHub fine-grained token',re:/github_pat_[A-Za-z0-9_]{60,}/},
  {kind:'Supabase secret key',re:/sb_secret_[A-Za-z0-9_-]{24,}/},
  {kind:'AWS access key ID',re:/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/},
  {kind:'Google API key',re:/\bAIza[0-9A-Za-z_-]{35}\b/},
  {kind:'Stripe secret live key',re:/\bsk_live_[A-Za-z0-9]{20,}\b/},
  {kind:'Slack bot/user token',re:/\bxox[baprs]-\d{8,}-\d{8,}-[A-Za-z0-9]{24,}\b/}
];
const detect=text=>checks.filter(c=>c.re.test(text)).map(c=>c.kind);
// Las muestras se ensamblan en memoria; no agregan cadenas con forma de secreto al Git.
const positives=[
  ['sb','_secret_','x'.repeat(32)].join(''),
  ['ghp_','A'.repeat(36)].join(''),
  ['AKIA','A'.repeat(16)].join(''),
  ['-----BEGIN ','PRIVATE KEY-----'].join(''),
  ['sk_live_','a'.repeat(24)].join('')
];
for(const sample of positives)
  assert(detect(sample).length>0,'El detector debe identificar una credencial con patrón reconocido');
for(const sample of ['sb_publishable_public','demo@example.com','ghp_example','AIza_placeholder'])
  assert.deepEqual(detect(sample),[],'No marcar texto inocuo de documentación');

let checked=0;
const findings=[];
for(const path of tracked){
  if(!textExtensions.has(extname(path).toLowerCase())&&!textNames.has(path))continue;
  const absolute=resolve(root,path);
  assert(statSync(absolute).size<=2*1024*1024,
    'Revisar archivo textual mayor a 2 MiB: '+path);
  const content=readFileSync(absolute,'utf8');
  for(const check of checks){
    const match=check.re.exec(content);
    if(!match)continue;
    const line=content.slice(0,match.index).split('\n').length;
    findings.push(path+':'+line+' ('+check.kind+')');
  }
  checked++;
}
assert.deepEqual(findings,[],
  'Posibles credenciales incrustadas en archivos versionados. Investigar SIN publicar valores:\n'+findings.join('\n'));
console.log('Escaneo de contenido textual de HEAD aprobado: '+checked+' archivos. No sustituye rotación, historial ni escaneo especializado.');
