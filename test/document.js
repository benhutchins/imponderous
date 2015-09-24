'use strict'

let assert = require('assert-plus')

describe('Document', function () {
  let imponderous = require('../index')
  let user = require('./docs/user')

  imponderous.connect(__dirname + '/db')

  describe('.key', () => {
    it('should return a valid UUID', () => {
      assert.string(user.key)
      assert.uuid(user.key)
    })

    it('should allow key reassignment', () => {
      var oldKey = user.key
      user.key = 'tuser'
      assert.equal(user.key, 'tuser')
      assert.equal(user._oldKey, oldKey)
    })
  })

  describe('#get', function () {
    it('should provide undefined to unknown fields', function () {
      assert.equal(user.get('undefined'), undefined)
    })

    it('should return values for known fields', function () {
      assert.bool(user.get('spam'))
      assert.equal(user.get('spam'), false)
    })

    it('should traverse dotted notation for fields', function () {
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

    it('should traverse dotted notation for field', function () {
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

    it('should delete multiple properties', function () {
      user.rm('name.first', 'spam')

      assert.equal(user.get('name.first'), undefined)
      assert.equal(user.get('spam'), undefined)
    })
  })
})
