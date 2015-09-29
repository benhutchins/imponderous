'use strict'

let fs = require('fs')
let path = require('path')
let _ = require('lodash')
let assert = require('assert-plus')
let del = require('del')
let imponderous = require('./')
let DataModel = require('./data-model')

class Model extends DataModel {
  // ----- Collection methods -----

  // retrieve a document by its key
  static get (key) {
    if (!this.cache) {
      this.cache = {}
    }

    // look in cache, if doesn't exist, load document
    if (_.isUndefined(this.cache[key])) {
      let doc = new this(key)
      return doc._load()
    }

    // we still need to return a promise to keep the API consistent
    return new Promise((resolve, reject) => {
      resolve(this.cache[key])
    })
  }

  // retrieve a document by a specific property
  static getBy (field, value) {
    // verify field is enforced to be unique
    if (!_.includes(this.unique, field)) {
      throw new Error('Model.getBy only works with unique properties. Use Model.find instead')
    }

    let query = {}
    query[field] = value

    return this.findOne(query)
  }

  // helper to destroy a specific document by key
  static destroy (key) {
    return new Promise((resolve, reject) => {
      this.get(key).then((doc) => {
        if (doc) {
          doc.destroy().then(resolve, reject)
        }
      })
    })
  }

  // delete an entire collection
  static destroyAll () {
    return del(path.join(this.root, '**'))
  }

  // find documents matching search
  static find (query, options) {
    assert.object(query, 'query')
    assert.ok(_.keys(query).length > 0, 'query')
    options = options || {}

    return new Promise((resolve, reject) => {
      this._loadIndex().catch(reject).then((index) => {
        index = _.clone(index)

        if (_.keys(index).length === 0) {
          return resolve(options.limit === 1 ? null : [])
        }

        let items = {}

        _.each(index, (fields, key) => {
          let matches = _.every(query, (value, field) => {
            return fields[field] === value
          })

          if (matches) {
            items[key] = fields
          }
        })

        if (options.limit === 1) {
          items = items.slice(0, 1)
        }

        let promises = _.map(items, (fields, key) => {
          return this.get(key)
        })

        Promise.all(promises).then(resolve, reject)
      })
    })
  }

  static findOne (params) {
    return this.find(params, { limit: 1 })
  }

  static all (options) {
    _.defaults(options, {
      load: false,
      sort: null
    })

    return new Promise((resolve, reject) => {
      let finish = function (docs) {
        if (options.sort) {
          //
        }

        resolve(docs)
      }

      // look at every file in collection directory
      fs.readdir(this.root, (err, files) => {
        if (err) {
          return reject(err)
        }

        files = _.without(files, 'index.json')

        let docs = {}

        let promises = _.map(files, (filename) => {
          let key = path.basename(filename, imponderous.formatter.ext)
          assert.notEqual(key, filename)
          let doc = new this(key)
          docs[key] = doc

          if (options.load) {
            return doc._load()
          }
        })

        if (options.load) {
          Promise.all(promises).then(() => {
            finish(docs)
          })
        } else {
          finish(docs)
        }
      })
    })
  }

  // return the pluralized name for the collection
  static get collectionName () {
    return this.name.toLowerCase().trim() + 's'
  }

  // return the directory for this collection
  static get root () {
    return path.join(imponderous.root, this.collectionName)
  }

  // return the absolute path to the index file
  static get indexFile () {
    return path.join(this.root, 'index.json')
  }

  // return the default values for model, based on schema
  static get defaults () {
    return _.mapValues(this.schema, 'default')
  }

  // return the list of fields that are required, based on schema
  static get required () {
    return _.keys(this.schema).filter(field => {
      return this.schema[field].required
    })
  }

  // return the list of fields that are unique, based on schema
  static get unique () {
    return _.keys(this.schema).filter(field => {
      return this.schema[field].unique
    })
  }

  // return the list of fields that should be indexed, based on schema
  static get indexed () {
    return _.keys(this.schema).filter(field => {
      return this.schema[field].index
    })
  }

  static reindex (useCache) {
    useCache = useCache !== false

    // using the cache assumes that the index file has some content,
    // and that it is still accurate, so we only need to update it
    // with the pending changes we know of
    if (useCache && this.cache) {
      // this.cache
      // TODO
    }

    return this.all({ load: true }).then((docs) => {
      let data = _.mapValues(docs, 'indexes')
      data = imponderous.formatter.toString(data)

      fs.writeFile(this.indexFile, data, 'utf8', function (err) {
        if (err) {
          console.error(err)
        } else {
          console.log('Write index')
        }
      })
    })
  }

  static _loadIndex () {
    return new Promise((resolve, reject) => {
      fs.readFile(this.indexFile, 'utf8', (err, contents) => {
        if (err) {
          // If file does not exist, then no index has been created,
          // that's not necessarily an error
          if (err.code === 'ENOENT' && err.errno === -2) {
            resolve({})
          }

          reject(err)
          return
        }

        try {
          let data = imponderous.formatter.toObject(contents)
          resolve(data)
        } catch (ex) {
          reject(new Error('Invalid JSON formatting for collection index'))
        }
      })
    })
  }
}

module.exports = Model
