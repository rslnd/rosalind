FROM phusion/passenger-nodejs

CMD ["/sbin/my_init"]

RUN curl https://install.meteor.com/ | sh

RUN apt-get update && apt-get -y install mdbtools

WORKDIR /app

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
