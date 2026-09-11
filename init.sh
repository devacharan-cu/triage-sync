#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npx create-next-app@latest tmp-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm -y
mv tmp-app/* ./
mv tmp-app/.eslintrc.json ./ 2>/dev/null
mv tmp-app/.gitignore ./ 2>/dev/null
rm -rf tmp-app
