/* eslint-env mocha */
import assert from 'assert'
import { usernameInitials, firstFreeUsername } from './generateUsername'

describe('users/methods/generateUsername', function () {
  it('builds lowercase initials from first + last name', function () {
    assert.equal(usernameInitials({ firstName: 'Anna', lastName: 'Bauer' }), 'ab')
    // spaces/hyphens are stripped; first remaining ascii letters are used
    assert.equal(usernameInitials({ firstName: 'Anna-Lena', lastName: 'von Bauer' }), 'av')
  })

  it('falls back to a single available name part', function () {
    assert.equal(usernameInitials({ lastName: 'Bauer' }), 'b')
    assert.equal(usernameInitials({ firstName: 'Anna' }), 'a')
    assert.equal(usernameInitials({}), '')
  })

  it('returns the base when free', function () {
    assert.equal(firstFreeUsername('ab', () => false), 'ab')
  })

  it('suffixes with the next free number on collisions', function () {
    assert.equal(firstFreeUsername('ab', u => ['ab'].includes(u)), 'ab2')
    assert.equal(firstFreeUsername('ab', u => ['ab', 'ab2'].includes(u)), 'ab3')
    assert.equal(firstFreeUsername('ab', u => ['ab', 'ab2', 'ab3'].includes(u)), 'ab4')
  })

  it('handles an empty base', function () {
    assert.equal(firstFreeUsername('', () => true), '')
  })
})
