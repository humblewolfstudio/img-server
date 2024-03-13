FROM node:slim

WORKDIR /express-server

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "src/index.js"]