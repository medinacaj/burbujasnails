// Comando único para el mismo conjunto de controles estáticos local y en CI.
import {spawnSync} from 'node:child_process';
const checks=['site-integrity','performance-budget','security','rls-contract','layout-contract','modern-ui','seo-gallery-map','seo-local','seo-cejas','gestion-precios','site-quality','gallery-modal','responsive-width','iconography','gitignore-security','no-tracked-secrets','no-embedded-credentials','public-hardening','catalog-seed-parity','catalog-live','deployment-verification'];
for(const file of ['app.js','gestion.js','bn-config.js','catalogo-live.js','data.js','admin.js']){
 const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
for(const file of ['scripts/sync-assets.mjs',...checks.map(name=>'tests/'+name+'.mjs')]){
 const result=spawnSync(process.execPath,[file],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
