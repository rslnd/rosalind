/* eslint-env mocha */
import { expect } from 'chai'
import { findParentMessage } from './findParentMessage'

describe('api', () => {
  describe('messages', () => {
    describe('findParentMessageId', () => {
      const parentMessage = { to: '+43 660 9999999' }
      const childMessage = { from: '436609999999' }
      const orphanMessage = { from: '436604444444' }
      const otherMessage1 = { to: '+43 660 1010101' }
      const otherMessage2 = { to: '+43 660 2020202' }

      const messages = [ otherMessage1, parentMessage, otherMessage2 ]

      it('finds existing parent message', () => {
        expect(findParentMessage({ messages, message: childMessage })).to.equal(parentMessage)
      })

      it('null if no parent message found', () => {
        expect(findParentMessage({ messages, message: orphanMessage })).to.equal(null)
      })
    })
  })
})
