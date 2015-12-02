var concestor = require('../')
var hyperlog = require('hyperlog')
var test = require('tape')
var memdb = require('memdb')

test('concestor', function (t) {
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
  t.plan(3 + Object.keys(links).length)

  var db = memdb()
  var log = hyperlog(db, { valueEncoding: 'json' })

  var keys = Object.keys(links)
  var nodes = {}, names = {}, hashes = {}

  ;(function next () {
    if (keys.length === 0) return ready()
    var key = keys.shift()
    var ln = links[key].map(function (link) { return hashes[link] })
    log.add(ln, key, function (err, node) {
      t.ifError(err)
      nodes[key] = node
      hashes[key] = node.key
      names[node.key] = key
      next()
    })
  })()

  function ready () {
    concestor(log, [ hashes.G, hashes.F, hashes.E ], function (err, cons) {
      var cs = cons.map(function (hash) { return names[hash] })
      t.deepEqual(cs, [ 'B' ])
    })
    concestor(log, [ hashes.C, hashes.B, hashes.I ], function (err, cons) {
      var cs = cons.map(function (hash) { return names[hash] })
      t.deepEqual(cs, [ 'B' ])
    })
    concestor(log, [ hashes.G, hashes.I ], function (err, cons) {
      var cs = cons.map(function (hash) { return names[hash] })
      t.deepEqual(cs, [ 'G' ])
    })
  }
})
