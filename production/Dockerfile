FROM node:8.1.4

COPY . /opt/app
WORKDIR /opt/app/programs/server

ENV NPM_CONFIG_LOGLEVEL warn

ENV LD_LIBRARY_PATH /lib/mdbtools
RUN bash -c "time bash -c 'wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  apt-get update && \
  apt-get install apt-transport-https && \
  sh -c 'echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get -y --no-install-recommends install libglib2.0-0 google-chrome-unstable && \
  wget -O /tmp/mdbtools.tar.gz https://github.com/albertzak/mdbtools/releases/download/0.7.1-fix-newlines/mdbtools-20161003.tar.gz && \
  tar -xzvf /tmp/mdbtools.tar.gz -C /usr/src/ && \
  mv /usr/src/lib /lib/mdbtools && \
  mv /usr/src/bin/* /bin/ && \
  ldconfig && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*'"

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
