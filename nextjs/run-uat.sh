#!/usr/bin/env bash
set -a
source .env.uat
set +a

npm run build && npm run start:uat
