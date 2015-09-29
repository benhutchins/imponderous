'use strict'

class CustomError {
  get name () {
    return this.constructor.name
  }
}

class ValidationError extends CustomError {}
class PreSaveFailError extends CustomError {}
class DoesNotExistError extends CustomError {}

module.exports = {
  ValidationError: ValidationError,
  PreSaveFailError: PreSaveFailError,
  DoesNotExistError: DoesNotExistError
}
