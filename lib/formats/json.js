'use strict'

let Formatter = require('../formatter')

class JSONFormat extends Formatter {
  static get defaults () {
    return {
      fileExtension: '.json',
      pretty: false
    }
  }

  // Convert given data into object
  toObject (data) {
    return JSON.parse(data)
  }

  // Convert given data into storable string
  toString (data) {
    if (this.options.pretty) {
      return JSON.stringify(data, null, 4)
    }

    return JSON.stringify(data)
  }
}

module.exports = JSONFormat
