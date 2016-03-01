Template.reportActions.onCreated ->
  $('[data-toggle="tooltip"]').tooltip()

Template.reportActions.events
  'click [rel="print"]': ->
    if window.native
      Winston.info('[Client] Printing: native')

      title = moment(Time.dayToDate(@day))
      title = title.format("YYYY-MM-DD-[#{TAPi18n.__('reports.thisDaySingular')}]")

      window.native.print({ title })
    else
      Winston.info('[Client] Printing: default')
      window.print()
