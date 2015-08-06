# Rosalind

## Setup

  0.  Ruby 2.2.2
  1.  [Postgres.app][http://postgresapp.com]
  2.  [Node.js][https://nodejs.org]
  3.  Qt5
    -  `brew update`
    -  `brew uninstall qt`
    -  `brew install qt5`
    -  `ln -s /usr/local/opt/qt5/bin/qmake /usr/local/bin/qmake`
  4.  Gems
    - `gem install pg -- --with-pg-config=/Applications/Postgres.app/Contents/Versions/9.4/bin/pg_config`
    - `brew install redis passenger mdbtools`
    - `gem install daemon_controller foreman`
    - `bundle`
  5.  Rails
    - `rake db:create`
    - `rake db:migrate`

## Develop

`foreman start`

## Test

`rake cucumber`

## Deploy

TODO
