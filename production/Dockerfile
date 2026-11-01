# Keep in sync with the Node version of the Meteor release (`meteor node --version`)
FROM node:24.22.1-trixie

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
# puppeteer launches the google-chrome-stable installed below (channel: 'chrome')
ENV PUPPETEER_SKIP_DOWNLOAD true

# Chrome for puppeteer (PDF reports). The .deb declares its own library
# dependencies, so apt resolves the correct (t64-renamed) packages on trixie.
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libxss1 \
    wget \
    gnupg \
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /src/*.deb

RUN bash -c "time bash -c 'npm install --omit=dev \
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
ENV PORT 3000
EXPOSE 3000

CMD ["/opt/app/entrypoint.sh"]
