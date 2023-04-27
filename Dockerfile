FROM node:18-alpine3.17
COPY package.json package-lock.json tsconfig.json  ./
COPY ./src ./src
RUN npm ci
RUN npm run build


FROM node:18-alpine3.17
WORKDIR /usr
COPY package.json ./
RUN npm install --omit=dev
COPY --from=0 /dist .
RUN npm install pm2 -g
EXPOSE 4000
CMD ["pm2-runtime", "index.js"]