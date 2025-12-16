## build runner
FROM node:20-alpine as builder
RUN apk add --no-cache openssl
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node

COPY --chown=node:node package*.json .
COPY --chown=node:node prisma ./prisma/
RUN --mount=type=secret,id=npmrc,target=./.npmrc,uid=1000 npm install --ignore-scripts

COPY --chown=node:node . .
RUN npm run build


## prod stage
FROM node:20-alpine as prod
RUN apk add --no-cache openssl
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN npm install -g prisma
RUN chown -R node:node /usr/local/lib/node_modules
WORKDIR /home/node/app
USER node

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY --chown=node:node package*.json .
RUN --mount=type=secret,id=npmrc,target=./.npmrc,uid=1000 npm clean-install --ignore-scripts &&\
    npm cache clean --force
COPY --chown=node:node prisma ./prisma/
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --chown=node:node ./config ./config

ENV PRISMA_EXECUTABLE=/usr/local/bin/prisma

CMD [ "node", "dist/src/main.js" ]