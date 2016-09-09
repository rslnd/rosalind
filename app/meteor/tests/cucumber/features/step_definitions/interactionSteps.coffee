module.exports = ->
  lastFormField = null


  # Follow a menu path: 'Inbound Calls > New Inbound Call'
  # Click on a text fragment: 'Mark as resolved'
  # Click on any element: '.btn.cancel'
  @When 'I click on \'$linkText\'', (linkText) ->
    menuPath = linkText.indexOf('>') isnt -1

    browser.waitForExist '#loaded'
    if menuPath
      level0 = ".level-0[title=\"#{linkText.split(' > ')[0]}\"]"
      browser.waitForVisible(level0)
      browser.moveToObject(level0)
      browser.leftClick()

      level1 = ".level-1[title=\"#{linkText.split(' > ')[1]}\"]"
      browser.waitForVisible(level1)
      browser.moveToObject(level1)
      browser.leftClick()
    else if browser.isExisting("[title=\"#{linkText}\"]")
      browser.moveToObject("[title=\"#{linkText}\"]")
      browser.leftClick()
    else if browser.isExisting('=' + linkText)
      try
        browser.click('=' + linkText)
      catch e
        browser.moveToObject('=' + linkText)
        browser.leftClick()
    else if browser.isExisting(linkText)
      browser.click(linkText)
    else if browser.isExisting('*=' + linkText)
      console.warn("DEPRECATED: Found element by partial text match `#{linkText}`")
      browser.click('*=' + linkText)
    else
      throw new Error('Could not find any element containing text: ' + linkText)

    browser.pause(500)

  @When 'I click on the button \'$buttonText\'', (buttonText) ->
    browser.waitForVisible('button=' + buttonText)
    browser.click('button=' + buttonText)

  @When 'I click on the link \'$linkText\'', (linkText) ->
    browser.waitForVisible('=' + linkText)
    browser.click('=' + linkText)

  @When /^I click on the (button|link|element) titled '([^']*)'/, (element, titleText) ->
    browser.waitForVisible("[title=\"#{titleText}\"]")
    browser.click("[title=\"#{titleText}\"]")

  @When 'inside the modal I click on \'$linkText\'', (linkText) ->
    browser.waitForVisible('.modal')
    browser.element('.modal').click('=' + linkText)

  @When 'I fill in \'$labelText\' with \'$fieldValue\'', (labelText, fieldValue) ->
    selector = 'label=' + labelText
    lastFormField = selector
    browser.waitForExist(selector)
    fieldId = browser.getAttribute(selector, 'for')
    browser.setValue('#' + fieldId, fieldValue)

  @When 'I submit the form', ->
    browser.waitForVisible(lastFormField)
    browser.submitForm(lastFormField)

  @When 'I press \'$key\'', (key) ->
    key.replace('Back space', '\uE003')
    key.replace('Tab', '\uE004')
    key.replace('Clear', '\uE005')
    key.replace('Return', '\uE006')
    key.replace('Enter', '\uE007')
    key.replace('Shift', '\uE008')
    key.replace('Control', '\uE009')
    key.replace('Alt', '\uE00A')
    key.replace('Escape', '\uE00C')
    key.replace('Left arrow', '\uE012')
    key.replace('Up arrow', '\uE013')
    key.replace('Right arrow', '\uE014')
    key.replace('Down arrow', '\uE015')
    key.replace('Pageup', '\uE00E')
    key.replace('Pagedown', '\uE00F')
    key.replace('Space', '\uE00D')
    browser.keys(key)
