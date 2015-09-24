'use strict'

let fs = require('fs')
let path = require('path')
let _ = require('lodash')
let assert = require('assert-plus')
let mkdirp = require('mkdirp')
let rimraf = require('rimraf')
let uuid = require('node-uuid')

let imponderous = require('./')
let JSONFormat = require('./formats/json')

class Model {
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
  }

  // ----- Document methods -----

  get key () {
    if (this._key) {
      return this._key
    } else {
      // TODO: Consider using uuid.v4 instead
      this._key = uuid.v1()
      return this._key
    }
  }

  set key (newKey) {
    if (this._key) {
      this._oldKey = this._key
    }

    this._key = newKey

    // let the collection know we changed keys
    this.emit('key.change', this._key, this._oldKey)
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
    var fields = _.map(arguments, (field) => {
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
    var required = this.constructor.required
    assert.arrayOfString(required, 'Model.required')
    var missing = _.filter(required, (field) => {
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
    return this.formatter.toString(this.data)
  }

  get formatter () {
    return new JSONFormat()
  }

  // return location of this document
  get file () {
    assert.string(this.key)
    assert.string(this.formatter.ext)
    var filename = this.key + this.formatter.ext
    var file = path.join(this.constructor.root, filename)
    return file
  }

  // save document to disk
  save () {
    if (arguments.length > 0) {
      this.set.apply(this, arguments)
    }

    let contents = this.formatter.toString(this.data)

    return new Promise((resolve, reject) => {
      // ensure the colleciton directory exists
      mkdirp(this.constructor.root, (err) => {
        if (err) {
          reject(err)
          return
        }

        // delete old document if necessary
        if (this._oldKey) {
          let oldFile = path.join(this.constructor.root, this._oldKey + this.formatter.ext)
          fs.unlinkSync(oldFile)
          // TODO: Make this use async
        }

        // write the document file
        fs.writeFile(this.file, contents, 'utf8', (err) => {
          if (err) {
            reject(err)
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
          reject(err)
        } else {
          try {
            this.data = this.formatter.toObject(contents)
          } catch (ex) {
            reject(ex)
          } finally {
            resolve(this)
          }
        }
      })
    })
  }

  // ----- Model methods -----

  // retrieve a document by its key
  static get (key) {
    if (!this.cache) {
      this.cache = {}
    }

    if (typeof this.cache[key] === 'undefined') {
      let doc = new this(key)
      this.cache[key] = doc
      return doc._load()
    }

    return this.cache[key]
  }

  // static destroy (key) {}

  // delete an entire collection
  destroyAll (collectionName) {
    var collection = this.collection(collectionName)

    return new Promise(function (resolve, reject) {
      rimraf(collection.root, function (err) {
        if (err) {
          reject()
        } else {
          resolve()
        }
      })
    })
  }

  // find documents matching search
  find (params, options) {
    var collection = this

    return new Promise((resolve, reject) => {
      this._loadIndex().catch(reject).then((index) => {
        index = _.clone(index)

        let items = index.filter((itemFields, itemKey) => {
          return params.every((value, key) => {
            return itemFields[key] === value
          })
        })

        items = items.keys().map((key) => {
          return collection.get(key)
        })

        resolve(items)
      })
    })
  }

  findOne (params) {
    return this.find(params, { limit: 1 })
  }

  all () {
    return new Promise((resolve, reject) => {
      // TODO
      resolve([])
    })
  }

  // run a callback on every document in the collection
  each (cb, options) {
    this.all().then(function (docs) {
      let func = options.func || 'each'
      _[func](docs, cb)
    })
  }

  // run a callback on every document in collection, until one of them returns false
  every (cb) {
    return this.each(cb, { func: 'every' })
  }

  // run a callback on some documents in collection, until one of them returns true
  some (cb) {
    return this.each(cb, { func: 'some' })
  }

  // return the pluralized name for the collection
  static get collectionName () {
    return this.name.toLowerCase().trim() + 's'
  }

  // return the directory for this collection
  static get root () {
    return path.join(imponderous.root, this.collectionName)
  }

  // return the default values for model, based on schema
  static get defaults () {
    return _.mapValues(this.schema, 'default')
  }

  static get required () {
    return _.keys(this.schema).filter(field => {
      return this.schema[field].required
    })
  }

  static _loadIndex () {
    let file = path.join(this.root, 'index.json')

    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, contents) => {
        if (err) {
          // If file does not exist, then no index has been created,
          // that's not necessarily an error
          if (err.code === 'ENOENT' && err.errno === -2) {
            resolve([])
          }

          reject(err)
          return
        }

        let json

        try {
          json = JSON.parse(contents)
        } catch (ex) {
          reject(new Error('Invalid JSON formatting for collection index'))
        }

        resolve(json)
      })
    })
  }
}

module.exports = Model
