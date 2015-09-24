'use strict'

let YAML = require('js-yaml')
let Formatter = require('../formatter')

class YAMLFormat extends Formatter {
  static get defaults () {
    return {
      fileExtension: '.yml'
    }
  }

  toObject (data) {
    return YAML.safeLoad(data)
  }

  toString (data) {
    return YAML.safeDump(data)
  }
}

module.exports = YAMLFormat
