# Rosalind

## Prerequisites

 - Node.js
 - Meteor
 - `npm install -g shelljs`

## Develop

`npm start`

### Test Driven Development

#### Cucumber

Annotate cucumber scenarios with `@dev` and watch `npm run server:tail:cucumber`

You may need to run `cd ./server/tests/cucumber/ && npm install`

#### Jasmine

Jasmine test output is displayed inside the Velocity Reporter (blue dot in the bottom left corner)

## Test

Run the full test suite with `npm test`

## Deploy

Build the native applications with `npm client:build`

Deploy to staging: TODO

Deploy to production: TODO
