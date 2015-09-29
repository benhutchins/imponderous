'use strict'

let assert = require('assert-plus')
let ObjectType = require('./object')

class Password extends ObjectType {
  static get defaults () {
    return {
      hasher: 'sha256'
    }
  }

  isValid () {
    super.isValid()

    assert.string(this.data.salt)
    assert.string(this.data.hash)
    assert.string(this.data.func)
  }

  hash (password) {
    //
  }

  check (password) {
    //
  }
}

module.exports = Password
