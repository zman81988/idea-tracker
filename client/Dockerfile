
FROM node:12.10.0

WORKDIR /usr/app

COPY package.json ./

COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN echo "copied everything over for client"

EXPOSE 3000

CMD ["yarn", "start"]