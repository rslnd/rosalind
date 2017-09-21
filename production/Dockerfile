FROM node:8.1.4

COPY . /opt/app
WORKDIR /opt/app/programs/server

ENV NPM_CONFIG_LOGLEVEL warn

ENV LD_LIBRARY_PATH /lib/mdbtools
RUN bash -c "time bash -c 'wget -O /tmp/mdbtools.tar.gz https://github.com/albertzak/mdbtools/releases/download/0.7.1-fix-newlines/mdbtools-20161003.tar.gz && \
  tar -xzvf /tmp/mdbtools.tar.gz -C /usr/src/ && \
  mv /usr/src/lib /lib/mdbtools && \
  mv /usr/src/bin/* /bin/ && \
  ldconfig && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*'"

RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /node_modules

USER pptruser

RUN bash -c "time bash -c 'yarn \
  && npm cache clear --force \
  && mv /opt/app/node_modules /opt/node_modules/ \
  && cp -r /opt/app/programs/server/node_modules/. /opt/node_modules/ \
  && mv /opt/app/package.json /opt/'"

WORKDIR /opt

RUN ln -s node_modules app/programs/server/node_modules \
  && ln -s node_modules app/programs/web.browser/node_modules

WORKDIR /opt/app

ENV PORT 80
EXPOSE 80

CMD ["node", "main.js"]
