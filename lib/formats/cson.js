'use strict'

let CSON = require('season')
let Formatter = require('../formatter')

class CSONFormat extends Formatter {
  static get defaults () {
    return {
      fileExtension: '.cson'
    }
  }

  toObject (data) {
    return CSON.parse(data)
  }

  toString (data) {
    return CSON.stringify(data)
  }
}

module.exports = CSONFormat
