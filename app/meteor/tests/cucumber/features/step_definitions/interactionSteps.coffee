module.exports = ->
  lastFormField = null


  # Follow a menu path: 'Inbound Calls > New Inbound Call'
  # Click on a text fragment: 'Mark as resolved'
  # Click on any element: '.btn.cancel'
  @When 'I click on \'$linkText\'', (linkText) ->
    menuPath = linkText.indexOf('>') isnt -1

    getSelector = (_linkText, level) ->
      if typeof level is 'number'
        '#' + _linkText.replace(/[^a-z]/ig, '-').toLowerCase() + '.level-' + level
      else
        _linkText

    browser.waitForExist '#loaded'
    if menuPath
      browser.execute ((s0) ->
        $(s0).click()
        return
      ), getSelector(linkText.split(' > ')[0], 0)
      browser.pause 300
      browser.execute ((s1) ->
        $(s1).click()
        return
      ), getSelector(linkText.split(' > ')[1], 1)
      browser.pause 300
      browser.waitForExist '#loaded'
    else if browser.isExisting('//a[@title="' + linkText + '"]')
      browser.execute ((title) ->
        $('a[title="' + title + '"]').click()
        return
      ), linkText
      browser.pause 300
      browser.waitForExist '#loaded'
    else
      if linkText.match(/(^\.|^\#)/ig)
        browser.waitForVisible linkText
        browser.click linkText
      else
        browser.pause 300
        foundAndClicked = browser.execute(((linkText) ->
          el = $('a,input,button,span').filter(':contains("' + linkText + '")').sort((a, b) ->
            Number($(b).zIndex()) - Number($(a).zIndex())
          )
          if el.length > 0
            el.first().click()
            true
          else
            false
        ), linkText)
        browser.pause 300
        browser.waitForExist '#loaded'
        expect(foundAndClicked.value).not.toBe false, 'Could not find any element (a|input|button|span) containing text: ' + linkText
    return


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
