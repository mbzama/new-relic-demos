export $(cat .env.dev | grep -v '^#' | xargs) && node dist/main

npm run build && npm run start:dev
