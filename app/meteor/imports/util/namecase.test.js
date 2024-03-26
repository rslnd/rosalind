/* eslint-env mocha */
import { expect } from 'chai'
import { namecase } from './namecase'

describe('util/namecase', () => {
  it('umlauts', () => {
    expect(namecase('ÖSTERREICHER')).to.equal('Österreicher')
    expect(namecase('OSTERRÄICHER')).to.equal('Osterräicher')
    expect(namecase('GAUSSA')).to.equal('Gaussa')
    expect(namecase('Gauße')).to.equal('Gauße')
    expect(namecase('gaußi')).to.equal('Gaußi')
    expect(namecase('So-Ro')).to.equal('So-Ro')
    expect(namecase('de U')).to.equal('de U')
    expect(namecase('U')).to.equal('U')
    expect(namecase('A de So')).to.equal('A de So')
    expect(namecase('Ól')).to.equal('Ól')
    // expect(namecase('GROS-BAUER')).to.equal('Gros-Bauer') // name casing is hopeless: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
  })
})
