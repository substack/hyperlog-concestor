var concestor = require('../')
var hyperlog = require('hyperlog')
var test = require('tape')
var memdb = require('memdb')

test('disjoint', function (t) {
  t.plan(2)
  var db = memdb()
  var log = hyperlog(db, { valueEncoding: 'json' })

  var links = {
    A: [],
    B: ['A'],
    C: ['B'],
    D: ['C'],
    E: [],
    F: ['E'],
    G: ['E'],
    H: ['F','G'],
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
    concestor(log, [ hashes.D, hashes.G, hashes.H ], function (err, cons) {
      var cs = cons.map(function (hash) { return names[hash] })
      t.deepEqual(cs, [])
    })
    concestor(log, [ hashes.I, hashes.A ], function (err, cons) {
      var cs = cons.map(function (hash) { return names[hash] })
      t.deepEqual(cs, [])
    })
  }
})
