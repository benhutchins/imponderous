'use strict'

let assert = require('assert-plus')

describe('SchemaTypes', function () {
  let imponderous = require('../index')
  let user = require('./docs/user')

  imponderous.connect(__dirname + '/db')

  describe('Date', function () {
    it('support Date type', function () {
      // user.set('dob', '01/01/2000')
      user.set('dob', new Date('01/01/2000'))
      assert.equal(user.get('undefined'), undefined)
    })
  })
})
