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
      browser.click(level0)

      level1 = ".level-1[title=\"#{linkText.split(' > ')[1]}\"]"
      browser.waitForVisible(level1)
      browser.click(level1)
    else if browser.isVisibleWithinViewport('<button>=' + linkText)
      browser.click('<button>=' + linkText)
    else if browser.isVisibleWithinViewport("[title=\"#{linkText}\"]")
      browser.click("[title=\"#{linkText}\"]")
    else if browser.isVisibleWithinViewport('=' + linkText)
      browser.click('=' + linkText)
    else if browser.isVisibleWithinViewport(linkText)
      browser.click(linkText)
    else if browser.isVisibleWithinViewport('*=' + linkText)
      console.warn("DEPRECATED: Found element by partial text match `#{linkText}`")
      browser.click('*=' + linkText)
    else
      throw new Error('Could not find any element containing text: ' + linkText)

    browser.pause(500)


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
