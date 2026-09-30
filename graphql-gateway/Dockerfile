FROM node:22-alpine

WORKDIR /app

# Ensure we have package.json. If we don't have it locally, this will fail unless we create it.
COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
