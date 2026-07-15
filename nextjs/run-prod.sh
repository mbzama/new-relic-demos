#!/usr/bin/env bash
set -a
source .env.prod
set +a

npm run build && npm run start:prod
