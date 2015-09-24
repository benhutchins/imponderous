'use strict'

let path = require('path')
let _ = require('lodash')
let assert = require('assert-plus')

const defaults = {
  format: 'json'
}

const imponderous = {
  options: {},

  config: function (options) {
    assert.object(options, 'options')
    assert.string(options.path, 'options.path')

    if (options.path) {
      this.root = path.resolve(options.path)
      delete options.path
    }

    this.options = _.extend({}, defaults, options)
  },

  connect: function (root) {
    this.root = path.resolve(root)
  },

  format: function () {
    return this.options.format
  },

  // return list of all supported formats
  formats: function () {
    return _.keys(require('./formats/'))
  }
}

module.exports = imponderous
