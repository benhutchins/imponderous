'use strict'

let fs = require('fs')
let path = require('path')
let _ = require('lodash')
let assert = require('assert-plus')
let mkdirp = require('mkdirp')
let uuid = require('node-uuid')
let imponderous = require('./')
let types = require('./schema-types/')
let errors = require('./errors')

class DataModel {
  constructor (keyOrData) {
    let args = Array.prototype.slice.call(arguments)

    if (_.isString(keyOrData)) {
      this._key = keyOrData
      args.shift()
    }

    this.data = _.extend({}, this.defaults/*, ...args*/)

    // TODO: Use ES6 spread operator
    _.each(args, (obj) => {
      _.extend(this.data, obj)
    })

    // Setup getters/setters
    _.each(this.constructor.schema, (props, field) => {
      Object.defineProperty(this, field, {
        enumerable: true,
        configurable: true,
        get: function () {
          return this.get(field)
        },
        set: function (v) {
          return this.set(field, v)
        }
      })
    })
  }

  // ----- Document methods -----

  // return the document key
  get key () {
    if (_.isUndefined(this._key)) {
      let keyField = _.keys(this.schema).filter(field => {
        return this.schema[field].key
      })

      assert.ok(keyField.length === 0 || keyField.length === 1, 'Schema fields has multiple "key" properties')

      if (keyField.length > 0) {
        keyField = _.first(keyField)

        this._key = this.get(keyField)
      }

      if (_.isUndefined(this._key)) {
        // TODO: Consider using uuid.v4 instead
        this._key = uuid.v1()
      }
    }

    return this._key
  }

  // when the key is updated, we need to update the collection cache,
  // and reindex (remove old key) along with removing the old file
  set key (newKey) {
    if (this._key) {
      this._oldKey = this._key
    }

    this._key = newKey

    if (this.constructor.cache && this.constructor.cache[this._oldKey]) {
      this.constructor.cache[this._key] = this
      delete this.constructor.cache[this._oldKey]
    }
  }

  field (field) {
    let props = this.constructor.schema[field]
    let array = _.isArray(props.type) && props.length === 1

    // look for [ {type: ... } ]
    if (array && _.isObject(_.first(props.type))) {
      props = _.first(props.type)
    }

    let Type = types.get(_.flatten(props.type).first())

    return new Type()
  }

  get (field) {
    return this._magicGetterSetter(this.data, field)
  }

  set (field, value) {
    if (_.isString(field) || _.isArray(field)) {
      return this._magicGetterSetter(this.data, field, value)
    }

    // TODO: Use ES6 spread operator
    _.each(arguments, (obj) => {
      _.extend(this.data, obj)
    })
  }

  _magicGetterSetter (obj, is, value) {
    if (typeof is === 'string') {
      return this._magicGetterSetter(obj, is.split('.'), value)
    } else if (is.length === 1 && value !== undefined) {
      obj[is[0]] = value
      return value
    } else if (is.length === 0) {
      return obj
    } else {
      return this._magicGetterSetter(obj[is[0]], is.slice(1), value)
    }
  }

  rm (field) {
    function reduce (obj, is) {
      if (is.length === 1) {
        try {
          delete obj[is[0]]
        } catch (ex) {
          // this means it didn't exist to begin with
        }
      } else if (is.length === 0) {
        return obj
      } else {
        return reduce(obj[is[0]], is.slice(1))
      }
    }

    // covert all fields requested to be deleted to path ararys
    let fields = _.map(arguments, (field) => {
      if (typeof field === 'string') {
        return field.split('.')
      } else {
        return field
      }
    })

    // do the deleting
    _.each(fields, (field) => {
      reduce(this.data, field)
    })

    return this
  }

  isValid (silent) {
    // ensure all requires fields are present
    let required = this.constructor.required
    assert.arrayOfString(required, 'Model.required')
    let missing = _.filter(required, (field) => {
      return _.isUndefined(this.get(field))
    })

    if (missing.length > 0) {
      if (!silent) {
        throw new Error('Missing required fields of: ' + missing.join(', '))
      }

      return false
    }

    // check values of properties
    // TODO

    return true
  }

  toJSON () {
    return this.data
  }

  toObject () {
    return this.data
  }

  toString () {
    return imponderous.formatter.toString(this.data)
  }

  get indexes () {
    return _.pick(this.data, this.constructor.indexed)
  }

  // return location of this document
  get file () {
    assert.string(this.key)
    assert.string(imponderous.formatter.ext)
    let filename = this.key + imponderous.formatter.ext
    let file = path.join(this.constructor.root, filename)
    return file
  }

  // save document to disk
  save (data) {
    if (_.isObject(data)) {
      this.set(data)
    }

    return new Promise((resolve, reject) => {
      if (!this.isValid()) {
        reject(new errors.ValidationError())
      }

      if (_.isFunction(this.onPreSave)) {
        let preSave = this.onPreSave()

        if (preSave === false) {
          reject(new errors.PreSaveFailError())
        } else if (preSave instanceof Promise) {
          // preSave.
          // TODO
        }
      }

      this.forceSave().then(resolve, reject)
    })
  }

  // save regardless of validation concerns, risky!!!
  forceSave () {
    if (arguments.length > 0) {
      this.set.apply(this, arguments)
    }

    let contents = imponderous.formatter.toString(this.data)

    return new Promise((resolve, reject) => {
      // ensure the colleciton directory exists
      mkdirp(this.constructor.root, (err) => {
        if (err) {
          reject(err)
          return
        }

        // delete old document if necessary
        if (this._oldKey) {
          let oldFile = path.join(this.constructor.root, this._oldKey + imponderous.formatter.ext)
          fs.unlinkSync(oldFile)
          // TODO: Make this use async
        }

        // write the document file
        fs.writeFile(this.file, contents, 'utf8', (err) => {
          if (err) {
            return reject(err)
          }

          // update cache
          if (_.isUndefined(this.constructor.cache)) {
            this.constructor.cache = {}
          }

          this.constructor.cache[this.key] = this

          // update the index
          if (this.constructor.indexed.length > 0) {
            this.constructor.reindex().then(() => {
              resolve(this)
            }, reject)
          } else {
            resolve(this)
          }
        })
      })
    })
  }

  // destroy a document, deleting it from disk
  destroy () {
    return new Promise((resolve, reject) => {
      fs.unlink(this.file, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  // load document's data from disk
  _load () {
    return new Promise((resolve, reject) => {
      fs.readFile(this.file, 'utf8', (err, contents) => {
        if (err) {
          if (err.code === 'ENOENT' && err.errno === -2) {
            return reject(new errors.DoesNotExistError())
          }

          return reject(err)
        }

        try {
          this.data = imponderous.formatter.toObject(contents)
        } catch (ex) {
          reject(ex)
        } finally {
          if (_.isUndefined(this.constructor.cache)) {
            this.constructor.cache = {}
          }

          this.constructor.cache[this.key] = this
          resolve(this)
        }
      })
    })
  }

  // You can override this in your sub-classes
  onPreSave () {
    //
  }
}

module.exports = DataModel
