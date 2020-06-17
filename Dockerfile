

# Setup and build the client

FROM node:12.10.0-alpine as client

WORKDIR /usr/app/client/
COPY client/package.json ./
COPY client/yarn.lock ./
RUN yarn install
COPY client/ ./
RUN yarn build
RUN echo "just ran build"


# Setup the server

FROM node:12.10.0-alpine

WORKDIR /usr/app/
COPY --from=client /usr/app/client/build/ ./client/build/

WORKDIR /usr/app/server/
COPY web_service/package.json ./
COPY web_service/yarn.lock ./
RUN apk --no-cache add --virtual builds-deps build-base python
RUN yarn install
COPY web_service/ ./

EXPOSE 8080