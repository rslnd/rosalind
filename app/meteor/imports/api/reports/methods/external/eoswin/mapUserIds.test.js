/* eslint-env mocha */
import chai from 'chai'
import { mapUserIds } from './mapUserIds'

const expect = chai.expect

describe('api', function () {
  describe('reports', function () {
    describe('eoswin mapUserIds', function () {
      const Users = {
        find: () => ({
          fetch: () => [
            { _id: 'a', external: { eoswin: { id: 'A1' } } },
            { _id: 'b', external: { eoswin: { id: 'A2' } } },
            { _id: 'c', external: { eoswin: { id: '3' } } }
          ]
        })
      }
      it('maps eoswinId to user id', () => {
        const mapIds = mapUserIds({ Users })

        expect(mapIds('A1')).to.equal('a')
        expect(mapIds('A2')).to.equal('b')
        expect(mapIds('A3')).to.equal('c')
      })

      it('maps normalized eoswinId to user id', () => {
        const mapIds = mapUserIds({ Users })

        expect(mapIds('1')).to.equal('a')
        expect(mapIds('2')).to.equal('b')
        expect(mapIds('A3')).to.equal('c')
      })
    })
  })
})
