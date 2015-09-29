'use strict'

// let _ = require('lodash')
let assert = require('assert-plus')
let SchemaType = require('../type')

class ObjectType extends SchemaType {
  isValid () {
    super.isValid()

    assert.object(this.data)
  }
}

module.exports = ObjectType
