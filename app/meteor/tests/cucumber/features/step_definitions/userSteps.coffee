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
    user = browser.execute -> Meteor.user()
    expect(user.value).not.toBeNull()

  @Then 'I should be logged out', ->
    user = browser.execute -> Meteor.user()
    expect(user.value).toBeNull()

  @Given 'I log out', ->
    browser.execute -> Meteor.logout()
