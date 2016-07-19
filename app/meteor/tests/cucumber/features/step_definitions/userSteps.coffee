users = require './fixtures/users'

module.exports = ->

  lastUsername = null

  @Given /^I am an? '(.*)'(?: with the roles? '(.*)')$/, (username, roles) ->
    lastUsername = users.create(username: username)
    users.setRoles
      username: lastUsername
      roles: roles

  @Given 'I am logged in', ->
    browser.waitForExist('#locale.en')
    browser.execute(((name) -> Meteor.loginWithPassword(name, '1111')), lastUsername)
    browser.waitForExist('li.user-menu')

  @Then 'I should be logged in', ->
    browser.waitForExist 'li.user-menu'
    user = browser.execute -> Meteor.user()
    expect(user.value).not.toBeNull()

  @Then 'I should be logged out', ->
    browser.waitForExist '#loginForm'
    user = browser.execute -> Meteor.user()
    expect(user.value).toBeNull()

  @Given /^I (log|am logged) out/, (nil) ->
    browser.execute -> Meteor.logout()
    browser.waitForExist '#loginForm'
