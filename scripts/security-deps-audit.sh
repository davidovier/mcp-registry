#!/usr/bin/env bash
set -euo pipefail

# Fail CI on known high/critical production dependency vulnerabilities.
# Uses pnpm's built-in audit command.
pnpm audit --prod --audit-level high
