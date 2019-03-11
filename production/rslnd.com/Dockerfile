FROM node:latest

RUN groupadd -r prod && \
  useradd -r -g prod prod && \
  mkdir -p /home/prod && \
  chown -R prod:prod /home/prod

USER prod
WORKDIR /home/prod

COPY package.json .
RUN yarn
COPY . .

CMD ["node", "index.js"]
