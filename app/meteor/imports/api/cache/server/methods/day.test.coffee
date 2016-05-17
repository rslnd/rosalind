describe 'cache', ->
  describe 'day', ->

    moment = require 'moment'
    { day } = require './day'

    result = null

    before ->
      options =
        eachDay: -> { customPropertyOnDay: 'x' }
        eachHour: -> { customPropertyOnHour: 'y' }
        eachBlock: -> { customPropertyOnBlock: 'z' }
      result = day(options)

    it 'returns an object', ->
      expect(result).to.be.an('object')

    it 'has default properties: day, hours', ->
      expect(Object.keys(result)).to.include.members(['day', 'hours'])

    it 'has custom properties', ->
      expect(Object.keys(result)).to.include.members(['customPropertyOnDay'])

    it 'first day in reults is today', ->
      expect(result.day.day).to.equal(moment().date())
      expect(result.day.month).to.equal(moment().month() + 1)
      expect(result.day.year).to.equal(moment().year())

    it 'day has 24 hours', ->
      expect(Object.keys(result.hours).length).to.equal(24)
      expect(Object.keys(result.hours)).to.include.members(['0', '1', '23'])

      describe 'hour', ->
        hour = null; before -> hour = result.hours[0]

        it 'has default properties: blocks', ->
          expect(Object.keys(hour)).to.include.members(['blocks'])

        it 'has custom properties', ->
          expect(Object.keys(hour)).to.include.members(['customPropertyOnHour'])

        it 'hour has 6x10 minute blocks', ->
          expect(Object.keys(hour.blocks).length).to.equal(6)
          expect(Object.keys(hour.blocks)).to.eql(['0', '10', '20', '30', '40', '50'])

        describe '10 minute block', ->
          block = null; before -> block = hour.blocks[0]

          it 'has custom properties', ->
            expect(Object.keys(block)).to.include.members(['customPropertyOnBlock'])
