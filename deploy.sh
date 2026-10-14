#!/usr/bin/env bash
# ดันไฟล์เว็บขึ้น branch gh-pages (GitHub Pages) — ทำงานแบบเดียวกับแพ็กเกจ gh-pages
# วิธี: คัดลอกไฟล์เว็บไป dist/ → สร้าง repo ชั่วคราวใน dist/ → commit → force push ไป gh-pages
# (branch gh-pages เก็บแค่ของ deploy ล่าสุด)
#
# ใช้งาน:  ./deploy.sh
# เปลี่ยน remote:  DEPLOY_REMOTE=https://github.com/<user>/<repo>.git ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

DIST=dist
FILES=(index.html style.css app.js .nojekyll assets)
DEFAULT_REMOTE=https://github.com/Jaynarol/bdo-training-planner.git

in_repo() { git rev-parse --is-inside-work-tree >/dev/null 2>&1; }

REMOTE="${DEPLOY_REMOTE:-}"
if [ -z "$REMOTE" ] && in_repo; then
  REMOTE="$(git remote get-url origin 2>/dev/null || true)"
fi
REMOTE="${REMOTE:-$DEFAULT_REMOTE}"

SRC=local
if in_repo; then
  SRC="$(git rev-parse --short HEAD 2>/dev/null || echo local)"
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo "⚠ มีไฟล์ที่ยังไม่ commit — จะ deploy ตามไฟล์ในเครื่องตอนนี้"
    SRC="$SRC-dirty"
  fi
fi

NAME="$(git config user.name || echo deploy)"
EMAIL="$(git config user.email || echo deploy@localhost)"

for f in "${FILES[@]}"; do
  [ -e "$f" ] || { echo "ไม่เจอ $f"; exit 1; }
done

rm -rf "$DIST"
mkdir -p "$DIST"
cp -R "${FILES[@]}" "$DIST/"

cd "$DIST"
git init -q -b gh-pages
git add -A
git -c user.name="$NAME" -c user.email="$EMAIL" commit -q -m "deploy $SRC $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "กำลัง push ไป $REMOTE (gh-pages)…"
git push --force "$REMOTE" gh-pages
cd ..
rm -rf "$DIST"

echo "✓ deploy เสร็จ — GitHub Pages อัปเดตภายในไม่กี่นาที"
echo "  (ครั้งแรก: ตั้ง Settings → Pages → Source: Deploy from a branch → gh-pages / root)"
