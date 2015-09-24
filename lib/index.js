'use strict'

let path = require('path')
let _ = require('lodash')
let assert = require('assert-plus')
let formats = require('./formats/')

const defaults = {
  format: 'json'
}

class Imponderous {
  constructor () {
    this.options = {}
  }

  config (options) {
    assert.object(options, 'options')
    assert.string(options.path, 'options.path')

    if (options.path) {
      this.root = path.resolve(options.path)
      delete options.path
    }

    this.options = _.extend({}, defaults, options)
  }

  connect (root) {
    this.root = path.resolve(root)
  }

  get format () {
    return this.options.format || defaults.format
  }

  // return list of all supported formats
  get formats () {
    return _.keys(formats)
  }

  // return the instance of formatter class
  get formatter () {
    let format = this.format

    if (_.isUndefined(formats[format])) {
      throw new Error('Unsupported format')
    }

    return new formats[format]()
  }
}

const imponderous = new Imponderous()

module.exports = imponderous
