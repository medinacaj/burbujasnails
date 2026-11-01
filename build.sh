#!/usr/bin/env bash
# Empaquetado sin alterar el árbol de Git; Pages distribuye los archivos de master.
set -euo pipefail
cd "$(dirname "$0")"
node scripts/sync-assets.mjs --check
PKG=$(mktemp -d)
trap 'rm -rf "$PKG"' EXIT
cp -R index.html gestion.html gestion.css gestion.js bn-config.js catalogo-live.js admin.html privacidad.html 404.html legacy-route.js favicon.svg styles.css app.js data.js robots.txt sitemap.xml gallery "$PKG/"
rm -f "$PKG/gallery/.gitkeep"
rm -f burbujas-nails.zip
(cd "$PKG" && zip -qr - .) > burbujas-nails.zip
echo "Paquete generado y recursos verificados: burbujas-nails.zip"
