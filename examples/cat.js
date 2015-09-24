'use strict'

let imponderous = require('../index')

imponderous.config({
  path: __dirname + '/db'
})

class Cat extends imponderous.Model {
  static get schema () {
    return {
      name: String
    }
  }
}

let kitty = new Cat({ name: 'Zildjian' })

kitty.save().catch(function (err) {
  // ...
}).then(function () {
  console.log('meow')
})
