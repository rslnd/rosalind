url from 'url'
locale from './fixtures/locale'

module.exports = ->
  @Given 'I am on the dashboard', ->
    browser.url(process.env.ROOT_URL)
    browser.pause(150)
    locale.reset()

  @When 'I navigate to \'$relativePath\'', (relativePath) ->
    browser.url(url.resolve(process.env.ROOT_URL, relativePath))
    locale.reset()

  @When 'I refresh the page', ->
    browser.refresh()
