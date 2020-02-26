FROM node:12.10.0-alpine

WORKDIR /usr/app

COPY ./package.json ./

COPY ./yarn.lock ./

#https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions#docker
RUN apk --no-cache add --virtual builds-deps build-base python

RUN yarn install --frozen-lockfile

RUN npm rebuild bcrypt --build-from-source

COPY . .

RUN echo "copied everythign over for server"

EXPOSE 8080

CMD ["yarn", "start"]
