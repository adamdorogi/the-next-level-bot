FROM node:16-alpine AS base
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ src/
RUN npm install
RUN npm run build

FROM node:16-alpine AS release
WORKDIR /usr/src/app
COPY --from=base package*.json ./
RUN npm ci --only=production
COPY --from=base dist/. ./
CMD [ "node", "bot.js" ]
