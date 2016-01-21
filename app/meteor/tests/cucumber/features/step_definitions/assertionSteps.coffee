moment = require('moment')

module.exports = ->
  @Before ->
    browser.timeoutsImplicitWait(3 * 1000)
    browser.waitForExist('#loaded')

  failOnError = ->
    lastError = browser.execute(-> window.lastError).value
    message = lastError and lastError.message
    expect(lastError).toBeNull(message)
    browser.execute(-> window.lastError = null)

  @Before failOnError
  @After failOnError

  @Then 'I should see \'$string\'', (string) ->
    browser.waitForExist('#loaded')
    mainText = browser.getText('body')
    expect(mainText.toLowerCase()).toContain(string.toLowerCase())

  @Then 'I should not see \'$string\'', (string) ->
    browser.waitForExist('#loaded')
    mainText = browser.getText('body')
    expect(mainText.toLowerCase()).not.toContain(string.toLowerCase())

  @Then 'I should see \'$string\' in \'$element\'', (string, element) ->
    browser.waitForExist(element)
    elementText = browser.getText(element)
    if typeof elementText is 'object'
      elementText = elementText.join(' ')
    expect(elementText.toLowerCase()).toContain(string.toLowerCase())

  @Then 'the field \'$labelText\' should be empty', (labelText) ->
    browser.waitForExist('#loaded')
    browser.element 'label=' + labelText
    fieldId = browser.getAttribute('label=' + labelText, 'for')
    fieldValue = browser.getValue('#' + fieldId)
    expect(fieldValue).toEqual('')

  @Then 'I should see the current time', ->
    time = moment().format('HH:mm')
    browser.waitForExist('#loaded')
    bodyText = browser.getText('body')
    expect(bodyText).toContain(time.slice(0, -1))

  @Then 'I should see the element \'$selector\'', (selector) ->
    browser.waitForVisible(selector)

  @Then /^I pause/, ->
    browser.debug()
