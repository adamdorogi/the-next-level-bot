FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
ADD ./dist/ ./
CMD [ "node", "bot.js" ]
