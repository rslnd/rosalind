FROM node:4.5.0-slim

RUN echo \
   'deb ftp://ftp.us.debian.org/debian/ jessie main\n \
    deb ftp://ftp.us.debian.org/debian/ jessie-updates main\n \
    deb http://security.debian.org jessie/updates main\n' \
    > /etc/apt/sources.list

RUN bash -c "time bash -c 'apt-get update && apt-get -y install \
      git \
      curl \
      gnome-doc-utils \
      libtool \
    	automake \
    	autoconf \
      build-essential \
      glib2.0-dev \
      bzip2'"

RUN bash -c "time bash -c 'cd /root/ && \
      git clone https://github.com/albertzak/mdbtools && \
      cd mdbtools && \
      autoreconf -i -f && \
      ./configure --disable-man && \
      make && \
      make install'"

RUN bash -c "time bash -c 'apt-get -y purge \
      gnome-doc-utils \
      libtool \
      automake \
      autoconf \
      glib2.0-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*'"

COPY . /opt/app
WORKDIR /opt/app/programs/server

ENV NPM_CONFIG_LOGLEVEL warn

RUN bash -c "time bash -c 'npm install -g npm-install-retry \
  && npm-install-retry --wait 500 --attempts 10 -- --progress=false --depth=0 \
  && npm cache clear \
  && mv /opt/app/programs/server/node_modules /opt/'"


RUN mv /opt/app/package.json /opt

WORKDIR /opt

RUN bash -c "time bash -c 'npm-install-retry --wait 500 --attempts 10 -- --progress=false --depth=0 \
  && npm cache clear'"

RUN ln -s node_modules app/programs/server/node_modules \
  && ln -s node_modules app/programs/web.browser/node_modules

WORKDIR /opt/app

ENV PORT 80
EXPOSE 80

CMD ["node", "main.js"]
