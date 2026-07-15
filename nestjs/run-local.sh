export $(cat .env | grep -v '^#' | xargs) && node dist/main

npm run build && npm run start:nr
