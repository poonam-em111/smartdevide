#!/usr/bin/env bash
# Push wiki content from wiki/*.md to the GitHub Wiki so it displays at
# https://github.com/poonam-em111/smartdevide/wiki
#
# Prerequisites:
# 1. Enable Wiki on the repo (Settings → Features → Wiki).
# 2. Create the first page once on GitHub (e.g. paste Home.md) so the wiki repo exists.
# 3. You have push access to the repo.
#
# Usage: run from the repo root (IDE Extension): ./scripts/publish-wiki-to-github.sh

set -e
REPO="poonam-em111/smartdevide"
WIKI_REPO="https://github.com/${REPO}.wiki.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WIKI_SRC="$REPO_ROOT/wiki"
TMP_WIKI=$(mktemp -d 2>/dev/null || mktemp -d -t 'smartdevide-wiki')

echo "Cloning wiki repo..."
git clone "$WIKI_REPO" "$TMP_WIKI"

echo "Copying wiki pages..."
for f in "$WIKI_SRC"/Home.md "$WIKI_SRC"/Features.md "$WIKI_SRC"/Installation.md "$WIKI_SRC"/Roadmap.md; do
  [ -f "$f" ] && cp "$f" "$TMP_WIKI/" && echo "  - $(basename "$f")"
done

cd "$TMP_WIKI"
if git diff --quiet && git diff --staged --quiet 2>/dev/null; then
  echo "No wiki changes to push."
  rm -rf "$TMP_WIKI"
  exit 0
fi

git add -A
git commit -m "Update wiki from repo wiki/ content" || true
echo "Pushing to GitHub Wiki..."
git push origin master 2>/dev/null || git push origin main 2>/dev/null || git push

rm -rf "$TMP_WIKI"
echo "Done. Wiki is at: https://github.com/${REPO}/wiki"
