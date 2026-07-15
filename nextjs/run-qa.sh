#!/usr/bin/env bash
set -a
source .env.qa
set +a

npm run build && npm run start:qa
