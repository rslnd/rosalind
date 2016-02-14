module.exports = ->

  lastUsername = null

  @Given /^I am an? '(.*)'(?: with the roles? '(.*)')$/, (username, roles) ->
    lastUsername = server.call('fixtures/users/create', username: username)
    server.call 'fixtures/users/setRoles',
      username: lastUsername
      roles: roles

  @Given 'I am logged in', ->
    browser.execute(((name) -> Meteor.loginWithPassword(name, '1111')), lastUsername)
    browser.waitForExist 'li.user-menu'

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
