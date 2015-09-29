'use strict'

let DataModel = require('./data-model')

class SingletonModel extends DataModel {
  // Replace key methods

  get key () {
    return 'singleton'
  }

  set key (value) {
    throw new Error('Cannot set key for a singleton collection')
  }
}

module.exports = SingletonModel
