# Getting Started

_First be sure you have [Node.js](http://nodejs.org/) 4.0+ installed._

Next install Imponderous from the command line using npm:

    npm install imponderous

Now say we like fuzzy kittens and want to record every kitten we ever meet with Imponderous. The first thing we need to do is include `imponderous` in our project and setup a test database.

```js
// getting-started.js
var imponderous = require('imponderous')
imponderous.connect(__dirname + '/db')
```

Since Imponderous is a file-based database, there is no open connection. Once our connection opens, our callback will be called. For brevity, let's assume that all following code is within this callback.

With Imponderous, everything is derived from a [Schema](guide.md). Let's get a reference to it and define our kittens.

```js
{
  name: String
}
```

So far so good. We've got a schema with one property, `name`, which will be a `String`. The next step is compiling our schema into a [Model](models.md).

```js
class Kitten extends imponderous.Model {
  static get schema () {
    return {
      name: String
    }
  }
}
```

A model is a class with which we construct documents. In this case, each document will be a kitten with properties and behaviors as declared in our schema. Let's create a kitten document representing the little guy we just met on the sidewalk outside:

```js
var silence = new Kitten({ name: 'Silence' })
console.log(silence.get('name')) // 'Silence'
```

Kittens can meow, so let's take a look at how to add "speak" functionality to our documents:

```js
class Kitten extends imponderous.Model {
  static get schema () {
    return kittySchema
  }

  speak () {
    var greeting = this.name
      ? "Meow name is " + this.name
      : "I don't have a name"
    console.log(greeting)
  }
}
```

You can extend your `Model` class with both static and instance methods using [ES6 Class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/class) syntax:

```js
var fluffy = new Kitten({ name: 'fluffy' })
fluffy.speak() // "Meow name is fluffy"
```

We have talking kittens! But we still haven't saved anything to disk. Each document can be saved by calling its `save` method, which returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```js
fluffy.save(function (fluffy) {
  fluffy.speak()
}, function (err) {
  console.error(err)
})
```

Say time goes by and we want to display all the kittens we've seen. We can access all of the kitten documents through our Kitten [model](models.md).

```js
Kitten.all().then(function (kittens) {
  console.log(kittens)
}).catch(function (err) {
  console.error(err)
})
```

We just logged all of the kittens on disk to the console. If we want to filter our kittens by name, Imponderous supports some rich [querying](queries.md) syntax.

```js
Kitten.find({ name: /^Fluff/ }).then(callback)
```

This performs a search for all documents with a name property that begins with "Fluff" and returns the result as an array of kittens to the callback.

## Congratulations

That's the end of our quick start. We created a schema, added a custom document method, saved and queried kittens using Imponderous. Head over to the [guide](guide.md), or [API docs](api.md) for more.

Inspired by Mongoose's documentation.
