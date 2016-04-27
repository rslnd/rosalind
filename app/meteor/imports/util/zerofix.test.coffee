{ zerofix } = require './zerofix'

describe 'helpers', ->
  describe 'zerofix', ->

    it 'should not change correct phone number', ->
      expect(zerofix('+43 0660 9911994')).to.equal('+43 0660 9911994')

    it 'should change the letter O to zeroes', ->
      expect(zerofix('o660 9911994')).to.equal('0660 9911994')
      expect(zerofix('o66o 9911994')).to.equal('0660 9911994')
      expect(zerofix('O66o 9911994')).to.equal('0660 9911994')
      expect(zerofix('0oOo')).to.equal('0000')

    it 'should not change the letter O to zeroes if they are in a word', ->
      expect(zerofix('hello')).to.equal('hello')
      expect(zerofix('0660 or 0660')).to.equal('0660 or 0660')
      expect(zerofix('o660 oder 4oo4')).to.equal('0660 oder 4004')

    it 'should split long numbers into chunks of four', ->
      expect(zerofix('123456789')).to.equal('1234 5678 9')
      expect(zerofix('o66o9911994')).to.equal('0660 9911 994')
      expect(zerofix('this is a sentence')).to.equal('this is a sentence')
