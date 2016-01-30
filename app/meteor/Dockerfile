FROM phusion/passenger-nodejs

CMD ["/sbin/my_init"]

RUN curl https://install.meteor.com/ | sh

WORKDIR /app

ENTRYPOINT meteor --settings settings.json

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
