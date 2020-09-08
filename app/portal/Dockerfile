FROM theasp/clojurescript-nodejs:shadow-cljs-alpine as build
WORKDIR /app
COPY package.json package-lock.json shadow-cljs.edn /app/
RUN shadow-cljs npm-deps && npm install --save-dev shadow-cljs
COPY ./ /app/
RUN shadow-cljs release portal

FROM node:alpine
WORKDIR /app
EXPOSE 4000
CMD ["npm", "run", "start"]
COPY --from=build /app/ /app/
