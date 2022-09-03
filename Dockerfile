FROM node:18.7.0-alpine3.15
ARG VITE_DATABASE1
ARG VITE_SECRETKEY
ENV TZ=Turkey
ENV NODE_OPTIONS=--openssl-legacy-provider

#ADD ./app/.npmrc /app/.npmrc
ADD ./app/package.json /app/package.json
ADD ./app/svelte.config.js /app/svelte.config.js
ADD ./app/vite.config.js /app/vite.config.js
ADD ./app/src /app/src
ADD ./app/static /app/static

RUN echo VITE_DATABASE1=${VITE_DATABASE1} > /app/.env
RUN echo VITE_SECRETKEY=${VITE_SECRETKEY} >> /app/.env

WORKDIR /app

RUN npm install
RUN npm run build
ENTRYPOINT npm run preview
#ENTRYPOINT top

EXPOSE 8008