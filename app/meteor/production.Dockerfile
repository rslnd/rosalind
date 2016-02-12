FROM meteorhacks/meteord:onbuild

RUN apt-get update \
  && apt-get -y install mdbtools \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
