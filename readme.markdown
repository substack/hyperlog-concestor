# hyperlog-concestor

compute the most recent common ancestor among nodes in a
[hyperlog](https://npmjs.com/package/hyperlog)

# example

``` js
var concestor = require('hyperlog-concestor')
var hyperlog = require('hyperlog')

var db = require('memdb')()
var log = hyperlog(db, { valueEncoding: 'json' })

var links = {
  A: [],
  B: ['A'],
  C: ['B'],
  D: ['C'],
  E: ['D'],
  F: ['B'],
  G: ['F'],
  H: ['G','E'],
  I: ['H']
}

var keys = Object.keys(links)
var nodes = {}, names = {}, hashes = {}

;(function next () {
  if (keys.length === 0) return ready()
  var key = keys.shift()
  var ln = links[key].map(function (link) { return hashes[link] })
  log.add(ln, key, function (err, node) {
    nodes[key] = node
    hashes[key] = node.key
    names[node.key] = key
    next()
  })
})()

function ready () {
  concestor(log, [ hashes.G, hashes.F, hashes.E ], function (err, cons) {
    var cs = cons.map(function (hash) { return names[hash] })
    console.log('CONCESTORS of G, F, E:', cs)
  })
}
```

output:

```
CONCESTORS of G, F, E: [ 'B' ]
```

# api

``` js
var concestor = require('hyperlog-concestor')
```

## concestor(log, hashes, cb)

Compute the [concestor](https://en.wikipedia.org/wiki/Most_recent_common_ancestor)
of an array of `hashes` present in a hyperlog `log`. `cb(err, cons)` fires with
the array of concestors (there may be ties).

This module is not very coupled to hyperlog. Any `log` object with a
`.get(function (err, node) {})` and a `node.links` array of hashes will work.

# install

```
npm install hyperlog-concestor
```

# license

BSD
