# Imponderous [![Build Status](https://travis-ci.org/benhutchins/imponderous.svg)](https://travis-ci.org/benhutchins/imponderous)

Let's face it, sometimes you want a simple database that's fast, quick, speedy, swift and just downright blazing. That's why I wrote Imponderous.

```js
let imponderous = require('imponderous')

imponderous.connect(__dirname + '/db')

class Cat extends imponderous.Model {
  static get schema () {
    return { name: String }
  }
}

let kitty = new Cat({ name: 'Zildjian' })

kitty.save().catch(function (err) {
  // ...
}).then(function () {
  console.log('meow')
})

```

Imponderous is an extremely simple, straight-forward, schema-based modeling wrapper on top of a simple file-based database. It includes built-in type casting, validation, query building and more, out of the box offering many standard standard NoSQL methods on top of simple text files giving you some awesome utilities and a powerful database alternative.

## Getting Started

- [Quick start guide](https://github.com/benhutchins/imponderous/blob/master/docs/index.md)
