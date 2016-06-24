moment = require 'moment'

module.exports = ->
  @Then /^I should see '([^']*)'$/, (string) ->
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
    browser.waitForExist('#loaded')
    bodyText = browser.getText('body')

    time = moment().format('HH:mm')
    timeYeahWhatever = moment().subtract(1, 'minute').format('HH:mm')

    contains = bodyText.indexOf(time) >= 0 or bodyText.indexOf(timeYeahWhatever) >= 0
    expect(contains).toEqual(true, "Expected '#{bodyText}' to contain '#{time}' (or '#{timeYeahWhatever}')")

  @Then 'I should see the element \'$selector\'', (selector) ->
    browser.waitForVisible(selector)

  @Then /^I pause/, ->
    browser.debug()
