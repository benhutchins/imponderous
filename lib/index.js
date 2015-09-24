'use strict'

let path = require('path')
let assert = require('assert-plus')

const imponderous = {
  options: {},

  config: function (options) {
    assert.object(options, 'options')
    assert.string(options.path, 'options.path')

    this.root = path.resolve(options.path)
  },

  connect: function (root) {
    this.root = path.resolve(root)
  }
}

module.exports = imponderous
