#!/usr/bin/env bash
# Cache-busting + empaquetado ZIP para Burbujas Nails
set -euo pipefail
cd "$(dirname "$0")"

hash() {
  if command -v md5sum >/dev/null 2>&1; then md5sum "$1" | cut -c1-8
  else md5 -q "$1" | cut -c1-8; fi
}

for f in styles.css data.js app.js; do
  h=$(hash "$f")
  for page in index.html servicios.html privacidad.html 404.html admin.html; do
    sed -i.bak -E "s#(${f//./\\.})\?v=[A-Za-z0-9]*#\1?v=${h}#g" "$page" && rm -f "$page.bak"
  done
  echo "$f -> $h"
done

PKG=/tmp/bn-pkg
rm -rf "$PKG" && mkdir -p "$PKG"
cp -R index.html servicios.html admin.html privacidad.html 404.html favicon.svg styles.css app.js data.js robots.txt sitemap.xml gallery "$PKG/"
rm -f "$PKG/gallery/.gitkeep"
rm -f burbujas-nails.zip
(cd "$PKG" && zip -qr - .) > burbujas-nails.zip
echo "Generado: burbujas-nails.zip"
