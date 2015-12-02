var concestor = require('../')
var hyperlog = require('hyperlog')
var test = require('tape')
var memdb = require('memdb')

test('disjoint', function (t) {
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
  t.plan(4 + Object.keys(links).length)

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
    concestor(log, [ hashes.D, hashes.G, hashes.H ], function (err, cons) {
      var cs = cons.map(function (hash) { return names[hash] })
      t.deepEqual(cs, [], 'D,G,H: []')
    })
    concestor(log, [ hashes.I, hashes.A ], function (err, cons) {
      var cs = cons.map(function (hash) { return names[hash] })
      t.deepEqual(cs, [], 'I,A: []')
    })
    concestor(log, [ hashes.B ], function (err, cons) {
      var cs = cons.map(function (hash) { return names[hash] })
      t.deepEqual(cs, [ 'B' ], 'B: [B]')
    })
    concestor(log, [], function (err, cons) {
      var cs = cons.map(function (hash) { return names[hash] })
      t.deepEqual(cs, [], '[]: []')
    })
  }
})
