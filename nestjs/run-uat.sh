export $(cat .env.uat | grep -v '^#' | xargs) && node dist/main

npm run build && npm run start:uat
