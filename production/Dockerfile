FROM node:14.20.1

HEALTHCHECK \
  --interval=6s \
  --timeout=6s \
  --start-period=15s \
  --retries=5 \
  CMD \
  wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

COPY . /opt/app
WORKDIR /opt/app/programs/server

ENV NPM_CONFIG_LOGLEVEL warn
ENV TZ UTC
ENV NODE_ENV production

RUN apt-get update && apt-get install -y \
    libxss1 \
    libxtst6 \
    libgconf-2-4 \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    gnupg \
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

RUN bash -c "time bash -c 'yarn \
  && npm cache clear --force \
  && mv /opt/app/node_modules /opt/node_modules/ \
  && cp -r /opt/app/programs/server/node_modules/. /opt/node_modules/ \
  && mv /opt/app/package.json /opt/'"

WORKDIR /opt

RUN ln -s node_modules app/programs/server/node_modules \
  && ln -s node_modules app/programs/web.browser/node_modules

WORKDIR /opt/app

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /opt/node_modules/

USER pptruser
ENV NODE_ICU_DATA /opt/app/programs/server/npm/node_modules/full-icu/
ENV PORT 3000
EXPOSE 3000

CMD ["/opt/app/entrypoint.sh"]
