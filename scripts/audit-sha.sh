#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: pnpm audit:sha <git-sha>"
  exit 1
fi

TARGET_SHA="$1"
ORIGINAL_REF="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
ORIGINAL_SHA="$(git rev-parse HEAD)"

if ! git rev-parse --verify "${TARGET_SHA}^{commit}" >/dev/null 2>&1; then
  echo "Error: SHA '${TARGET_SHA}' does not resolve to a commit."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash changes before audit:sha."
  exit 1
fi

restore_ref() {
  if [[ -n "${ORIGINAL_REF}" && "${ORIGINAL_REF}" != "HEAD" ]]; then
    git checkout "${ORIGINAL_REF}" >/dev/null 2>&1 || true
  else
    git checkout --detach "${ORIGINAL_SHA}" >/dev/null 2>&1 || true
  fi
}

trap restore_ref EXIT

echo "==> Checking out ${TARGET_SHA}"
git checkout --detach "${TARGET_SHA}"

echo "==> Cleaning workspace"
git clean -xfd

echo "==> Installing dependencies deterministically"
pnpm install --frozen-lockfile

echo "==> Running Agent B audit sequence"
pnpm exec playwright test e2e/product-spec.spec.ts
pnpm test:e2e:heuristics
pnpm test:e2e:inventory
pnpm perf:report
pnpm product:backlog

echo "==> Audit sequence complete for ${TARGET_SHA}"
