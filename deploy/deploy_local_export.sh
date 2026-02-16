#!/bin/bash
set -euo pipefail

# Usage: ./deploy_local_export.sh
# Builds the project, runs `next export` and zips the `out/` folder for upload to shared hosting.

echo "Installing dependencies..."
npm ci

echo "Building..."
npm run build

echo "Exporting static site..."
npm run export

OUT_ZIP="site-out-$(date +%Y%m%d_%H%M%S).zip"
echo "Zipping out/ to ${OUT_ZIP}..."
zip -r "${OUT_ZIP}" out/

echo "Export complete. Upload ${OUT_ZIP} contents to Hostinger public_html."
