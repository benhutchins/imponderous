'use strict'

let imponderous = require('../../index')

class User extends imponderous.Model {
  static get schema () {
    return {
      name: {
        index: true
      },
      email: {
        unique: true,
        required: true,
        validator: 'email'
      },
      dob: {
        type: Date
      },
      spam: {
        type: String
      }
    }
  }
}

module.exports = User
