moment from 'moment-timezone'

module.exports = ->

  @Then 'I should see the current week of the year', ->
    currentWeekOfYear = moment().format('W')
    client.waitForExist '#loaded'
    bodyText = client.getText('body')
    expect(bodyText).toContain currentWeekOfYear
