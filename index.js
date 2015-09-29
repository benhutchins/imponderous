'use strict'

let imponderous = require('./lib/')

imponderous.Model = require('./lib/model')
imponderous.SingletonModel = require('./lib/singleton-model')

imponderous.Schema = {
  Types: require('./lib/schema-types/')
}

module.exports = imponderous
