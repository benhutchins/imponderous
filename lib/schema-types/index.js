'use strict'

const Types = {
  Any: require('../type'),
  Boolean: require('./boolean'),
  Date: require('./date'),
  File: require('./file'),
  Number: require('./number'),
  Object: require('./object'),
  Password: require('./password'),
  String: require('./string'),

  getType: function (type) {
    if (type === String) {
      return Types.String
    } else if (type === Boolean) {
      return Types.Boolean
    } else if (type === Number) {
      return Types.Number
    } else if (type === Date) {
      return Types.Date
    } else {
      return type
    }
  }
}

module.exports = Types
