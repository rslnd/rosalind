Template.bigstats.helpers
  showRevenue: ->
    Template.reports.currentView.get('showRevenue')

Template.bigstats.onCreated ->
  $('[data-toggle="tooltip"]').tooltip()
