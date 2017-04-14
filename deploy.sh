#!/bin/bash
REMOTE_URL=$(git config remote.origin.url)
HTTPS_PROTOCOL="https://"
GIT_PROTOCOL="git://"
REPO_URL=${REMOTE_URL/$HTTPS_PROTOCOL}
REPO_URL=${REPO_URL/$GIT_PROTOCOL}

yarn run build

cd build

git init

git config user.name "gandres' Travis CI"
git config user.email "gandres.ramirez@gmail.com"

git add -A .
git commit -m "Auto-updated GitHub Pages"

git push --force "https://${TOKEN}@${REPO_URL}" master:gh-pages >/dev/null 2>&1
