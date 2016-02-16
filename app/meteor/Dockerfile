FROM meteorhacks/meteord:onbuild

RUN apt-get update && apt-get -y install \
    git \
    curl \
    gnome-doc-utils \
    libtool \
  	automake \
  	autoconf \
    make \
    glib2.0-dev

RUN cd /root/ && \
  git clone https://github.com/albertzak/mdbtools && \
  cd mdbtools && \
  autoreconf -i -f
  ./configure --disable-man && \
  make && \
  make install

RUN apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
