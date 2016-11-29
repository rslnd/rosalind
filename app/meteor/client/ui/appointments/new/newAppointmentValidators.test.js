/* eslint-env mocha */
import { expect } from 'chai'
import { validate, validateNameCase } from './newAppointmentValidators'

describe('ui', () => {
  describe('appointments', () => {
    describe('newAppointment', () => {
      describe('validators', () => {
        it('should accept empty values', () => {
          expect(validate({})).to.eql({})
        })

        it('should reject missing fields when creating new patient', () => {
          expect(validate({
            patientId: 'newPatient'
          })).to.have.keys(['lastName', 'birthday', 'telephone'])
        })

        it('should reject missing birthday when creating new patient', () => {
          expect(validate({
            patientId: 'newPatient',
            lastName: 'Ok',
            telephone: '12345',
            birthday: '111111'
          })).to.have.keys(['birthday'])
        })

        it('should accept correct fields when creating new patient', () => {
          expect(validate({
            patientId: 'newPatient',
            lastName: 'Ok',
            telephone: '12345',
            birthday: { day: 1, month: 2, year: 3 }
          })).to.eql({})
        })

        it('should reject if last name casing looks bad', () => {
          expect(validateNameCase('farn')).to.equal(false)
          expect(validateNameCase('FARN')).to.equal(false)
          expect(validateNameCase('fARN')).to.equal(false)
        })

        it('should accept if last name casing looks correct', () => {
          expect(validateNameCase('Farn')).to.equal(true)
          expect(validateNameCase('U')).to.equal(true)
          expect(validateNameCase('de Bruijn')).to.equal(true)
          expect(validateNameCase('van der Bellen')).to.equal(true)
          expect(validateNameCase('deMarco')).to.equal(true)
        })
      })
    })
  })
})
