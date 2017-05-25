users from './fixtures/users'

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
    browser.waitForExist('#logged-in')

  @Then 'I should be logged in', ->
    browser.waitForExist('#logged-in')
    user = browser.execute -> Meteor.user()
    expect(user.value).not.toBeNull()

  @Then 'I should be logged out', ->
    browser.waitForExist 'form.login'
    user = browser.execute -> Meteor.user()
    expect(user.value).toBeNull()

  @Given /^I (log|am logged) out/, (nil) ->
    browser.execute -> Meteor.logout()
    browser.waitForExist 'form.login'
