FROM node:18.7.0-alpine3.15
ENV TZ=Turkey
ENV NODE_OPTIONS=--openssl-legacy-provider

ADD ./package.json /app/package.json
ADD ./svelte.config.js /app/svelte.config.js
ADD ./vite.config.js /app/vite.config.js
ADD ./src /app/src
ADD ./static /app/static
ADD ./.env /app/.env

WORKDIR /app

RUN npm install
RUN npm run build
ENTRYPOINT npm run preview
#ENTRYPOINT top

EXPOSE 8008