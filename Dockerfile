FROM node:16-alpine

WORKDIR /mb-eventos/

COPY package.json /mb-eventos/

COPY yarn* /mb-eventos/

RUN yarn install

COPY . .

USER node

EXPOSE 3000

CMD ["yarn", "start:local"]