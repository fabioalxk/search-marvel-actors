FROM node:latest

WORKDIR /app

COPY package.json /app

RUN npm install

COPY COPY . /app/

EXPOSE 3000

CMD ["node", "index.js"]