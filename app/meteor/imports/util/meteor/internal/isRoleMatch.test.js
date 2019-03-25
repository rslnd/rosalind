/* eslint-env mocha */
import { expect } from 'chai'
import { isRoleMatch } from './isRoleMatch'

describe('util', () => {
  describe('isRoleMatch', () => {
    it('false when no roles', () => {
      const requiredRoles = []
      const userRoles = []
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(false)
    })

    it('false when no user roles', () => {
      const requiredRoles = ['a']
      const userRoles = []
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(false)
    })

    it('false when no required', () => {
      const requiredRoles = []
      const userRoles = ['a']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(false)
    })

    it('true when exact match', () => {
      const requiredRoles = ['a']
      const userRoles = ['a']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(true)
    })

    it('true when full match', () => {
      const requiredRoles = ['a', 'hazelnut']
      const userRoles = ['b', 'c', 'hazelnut', 'a']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(true)
    })

    it('true when partial match', () => {
      const requiredRoles = ['a', 'hazelnut']
      const userRoles = ['b', 'c', 'hazelnut', 'x']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(true)
    })

    it('true when partial wildcard match', () => {
      const requiredRoles = ['a', 'hazelnut-*']
      const userRoles = ['m', 'hazelnut-unicorn', 'a']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(true)
    })

    it('false when no partial wildcard match', () => {
      const requiredRoles = ['a', 'hazelnut-unicorn']
      const userRoles = ['m', 'hazelnut-cow', 'b']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(false)
    })

    it('true when only wildcard', () => {
      const requiredRoles = ['*']
      const userRoles = ['a']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(true)
    })

    it('true when wildcard and non-matching others', () => {
      const requiredRoles = ['*', 'b']
      const userRoles = ['a']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(true)
    })

    it('true when wildcard and matching others', () => {
      const requiredRoles = ['*', 'a']
      const userRoles = ['a']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(true)
    })

    it('false when no partial wildcard match with wildcard in user role', () => {
      const requiredRoles = ['a', 'hazelnut-unicorn']
      const userRoles = ['m', 'hazelnut-*', 'c']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(false)
    })

    it('true when partial permissive wildcard match', () => {
      const requiredRoles = ['a', 'hazelnut-*']
      const userRoles = ['m', 'hazelnut', 'c']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(true)
    })

    it('false when non partial permissive wildcard match', () => {
      const requiredRoles = ['a', 'hazelnut-*']
      const userRoles = ['m', 'hazelnu', 'c']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(false)
    })

    it('keeps schedules/schedules-edit behaviour', () => {
      const requiredRoles = ['schedules-edit']
      const userRoles = ['schedules']
      expect(isRoleMatch({ requiredRoles, userRoles })).to.equal(false)
    })
  })
})
