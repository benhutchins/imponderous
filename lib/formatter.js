'use strict'

let _ = require('lodash')

class Formatter {
  constructor (options) {
    this.options = _.extend({}, this.constructor.defaults, options)
  }

  get ext () {
    return this.options.fileExtension
  }
}

module.exports = Formatter
