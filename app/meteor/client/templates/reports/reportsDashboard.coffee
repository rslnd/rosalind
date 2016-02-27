Template.reportsDashboard.onCreated ->
  @autorun =>
    @subscribe('reports')

Template.reportsDashboard.helpers
  report: ->
    Reports.findOne()
