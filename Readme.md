# Rosalind

![Unicorn Approved](https://img.shields.io/badge/unicorn-approved-blue.svg)
[![Latest Release](https://img.shields.io/github/release/albertzak/rosalind.svg?label=version)](https://github.com/albertzak/rosalind/releases)
[![Travis CI](https://img.shields.io/travis/albertzak/rosalind.svg?label=server build)](https://travis-ci.org/albertzak/rosalind/)
[![AppVeyor](https://img.shields.io/appveyor/ci/albertzak/rosalind.svg?label=app build)](https://ci.appveyor.com/project/albertzak/rosalind)

## Prerequisites

 - Node.js
 - Meteor

## Develop

`npm install`
`npm run server:start`

Create a new feature branch (eg. `feature/myFeature`)

Annotate cucumber scenarios with `@dev` and watch `npm run server:tail:cucumber`. Don't commit files with `@dev` in them - add a [pre-commit hook](https://gist.github.com/albertzak/8d512b923533077f4df5).

You may need to run `cd ./app/server/tests/cucumber/ && npm install`

Jasmine test output is displayed inside the Velocity Reporter (blue dot in the bottom left corner)

## Test

Run the full test suite with `npm test`

## Deploy

Build the native applications with `npm run client:build`

The `master` branch gets deployed to production automatically when all tests pass. Be careful when merging pull requests.

Deploy to staging: TODO
