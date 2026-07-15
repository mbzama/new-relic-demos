#!/usr/bin/env bash
set -a
source .env.dev
set +a

npm run build && npm run start:dev
