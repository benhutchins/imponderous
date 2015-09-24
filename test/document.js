'use strict'

let assert = require('assert-plus')

describe('Document', function () {
  let imponderous = require('../index')
  let user = require('./docs/user')

  imponderous.connect(__dirname + '/db')

  describe('#get', function () {
    it('should provide undefined to unknown fields', function () {
      assert.equal(user.get('undefined'), undefined)
    })

    it('should return values for known fields', function () {
      assert.string(user.get('name.first'))
      assert.equal(user.get('name.first'), 'John')
    })
  })

  describe('#set', function () {
    it('should set value for new fields', function () {
      user.set('email', 'test@example.com')

      assert.string(user.data.email)
      assert.equal(user.data.email, 'test@example.com')
    })

    it('should traverse dotted notation field names', function () {
      user.set('name.last', 'Smith')

      assert.string(user.data.name.last)
      assert.equal(user.data.name.last, 'Smith')
    })
  })

  describe('#rm', function () {
    it('should delete single property', function () {
      user.rm('email')

      assert.equal(user.get('email'), undefined)
    })
  })
})
