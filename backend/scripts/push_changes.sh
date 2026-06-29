#!/usr/bin/env bash

set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Run this script from inside a git repository." >&2
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
branch="$(git -C "$repo_root" branch --show-current)"

if [[ -z "$branch" ]]; then
  echo "Could not detect the current branch." >&2
  exit 1
fi

commit_message="${1:-Update $(date +%Y-%m-%d_%H-%M-%S)}"

echo "Current branch: $branch"
echo "Commit message: $commit_message"

git -C "$repo_root" add -A -- . \
  ':(exclude).env' \
  ':(exclude).env.local' \
  ':(exclude)local.db' \
  ':(exclude)**/__pycache__/**' \
  ':(exclude)**/*.pyc'

if git -C "$repo_root" diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 0
fi

git -C "$repo_root" commit -m "$commit_message"

if git -C "$repo_root" rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  git -C "$repo_root" push
else
  git -C "$repo_root" push -u origin "$branch"
fi

echo "Pushed $branch successfully."
