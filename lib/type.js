'use strict'

let _ = require('lodash')
let assert = require('assert-plus')

let defaults = {
  required: false,
  unique: false,
  default: null
}

class SchemaType {
  constructor (options) {
    this.options = _.extend({}, defaults, options)
  }

  get data () {
    return this._data || this.options.default
  }

  set data (value) {
    this._data = value
  }

  isValid () {
    if (this.options.required) {
      assert.notEqual(this.data, undefined)
      assert.notEqual(this.data, null)
    }

    if (this.options.unique) {
      // TODO
    }
  }
}

module.exports = SchemaType
