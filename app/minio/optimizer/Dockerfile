FROM node:12.22.2

RUN apt-get update && apt-get install -y \
    exiftran \
    jpegoptim \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y \
    && rm -rf /src/*.deb

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY index.js .

CMD ["node", "index.js"]
