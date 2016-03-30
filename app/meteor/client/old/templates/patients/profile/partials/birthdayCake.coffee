Template.birthdayCake.helpers
  birthdayToday: ->
    Time.dayToday(@profile?.birthday)

  attr: ->
    if Time.dayToday(@profile?.birthday)
      return {
        title: TAPi18n.__('patients.birthdayToday')
        'data-toggle': 'tooltip'
      }

Template.birthdayCake.onCreated ->
  $('[data-toggle="tooltip"]').tooltip()
