stats = new ReactiveDict('systemStats')

setStats = (e, res) ->
  Object.keys(res).forEach (key) ->
    stats.set(key, res[key])
  redrawChart()

redrawChart = ->
  chart = new Chart $('#appointments-mapping'),
    type: 'doughnut'
    data:
      labels: [ 'Mapped', 'Heuristically Mapped', 'Unmapped' ]
      datasets: [{
        data: [
          stats.get('appointmentsMapped')
          stats.get('appointmentsHeuristic')
          stats.get('appointmentsUnmapped')
        ]
        backgroundColor: [ '#46BFBD', '#FDB45C', '#F7464A' ]
        hoverBackgroundColor: [ '#5AD3D1', '#FFC870', '#FF5A5E' ]
      }]
    options:
      legend:
        display: false

Template.systemStats.refresh = ->
  Meteor.call 'system/stats/appointments', setStats

Template.systemStats.helpers
  stats: (key) ->
    stats.get(key)

Template.systemStats.onCreated ->
  Template.systemStats.refresh()
