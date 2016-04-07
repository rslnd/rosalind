moment = require 'moment'
{ TAPi18n } = require 'meteor/tap:i18n'
Time = require '/imports/util/time'

Template.reportActions.onCreated ->
  $('[data-toggle="tooltip"]').tooltip()

Template.reportActions.events
  'click [rel="today"]': ->
    Template.reports.currentView.set('date', new Date())

  'click [rel="previous"]': ->
    Template.reports.currentView.previous()

  'click [rel="next"]': ->
    Template.reports.currentView.next()

  'click [rel="print"]': ->
    if window.native
      console.log('[Client] Printing: native')

      title = moment(Time.dayToDate(@day))
      title = title.format("YYYY-MM-DD-[#{TAPi18n.__('reports.thisDaySingular')}]")

      window.native.print({ title })
    else
      console.log('[Client] Printing: default')
      window.print()
