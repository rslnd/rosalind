describe 'schedules', ->
  describe 'cache', ->

    moment = require 'moment'
    cache = require './cache'

    describe 'cacheNextDays', ->
      result = null

      before ->
        context =
          Appointments:
            methods:
              findAll: ->
                fetch: -> [ { _id: _str: 'app' } ]
          Schedules:
            methods:
              isOpen: -> true
              getScheduled: (time) -> [ { _id: 'aaa' }, { _id: 'bbb' } ]

        cache = cache(context)
        result = cache.cacheNextDays(10)

      it 'returns an array that has 10 day objects', ->
        expect(result).to.be.an('array')
        expect(result.length).to.equal(10)


      describe 'day', ->
        day = null; before -> day = result[0]

        it 'has properties: day, hours, isOpen', ->
          expect(Object.keys(day)).to.include.members(['day', 'hours', 'isOpen', 'scheduled'])
          expect(day.isOpen).to.equal(true)

        it 'first day in reults is today', ->
          expect(day.day.day).to.equal(moment().date())
          expect(day.day.month).to.equal(moment().month() + 1)
          expect(day.day.year).to.equal(moment().year())

        it 'day has 24 hours', ->
          expect(Object.keys(day.hours).length).to.equal(24)
          expect(Object.keys(day.hours)).to.include.members(['0', '1', '23'])

        it 'has scheduled users ids', ->
          expect(day.scheduled).to.include.members(['aaa', 'bbb'])

        it 'has appointment ids', ->
          expect(day.appointments).to.include.members(['app'])


        describe 'hour', ->
          hour = null; before -> hour = day.hours[0]

          it 'hour has 6x10 minute blocks', ->
            expect(Object.keys(hour.minutes).length).to.equal(6)
            expect(Object.keys(hour.minutes)).to.eql(['0', '10', '20', '30', '40', '50'])

          it 'has properties: minutes, isOpen, scheduled', ->
            expect(Object.keys(hour)).to.include.members(['isOpen', 'scheduled', 'appointments', 'minutes'])
            expect(hour.isOpen).to.equal(true)

          it 'has scheduled users ids', ->
            expect(hour.scheduled).to.include.members(['aaa', 'bbb'])

          it 'has appointment ids', ->
            expect(hour.appointments).to.include.members(['app'])


          describe '10 minute block', ->
            minute = null; before -> minute = hour.minutes[0]

            it 'has properties: isOpen, scheduled, appointments', ->
              expect(Object.keys(minute)).to.include.members(['isOpen', 'scheduled', 'appointments'])
              expect(minute.isOpen).to.equal(true)

            it 'has scheduled users ids', ->
              expect(minute.scheduled).to.include.members(['aaa', 'bbb'])

            it 'has appointment ids', ->
              expect(minute.appointments).to.include.members(['app'])
