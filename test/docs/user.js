'use strict'

let User = require('../models/user')

module.exports = new User({
  name: {
    first: 'John'
  },

  spam: false
})
