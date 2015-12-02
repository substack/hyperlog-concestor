var concestor = require('../')
var hyperlog = require('hyperlog')
var test = require('tape')
var memdb = require('memdb')

test('tied', function (t) {
  var links = {
    A: [],
    B0: ['A'],
    B1: ['A'],
    B2: ['A'],
    C: ['B0','B1','B2'],
    D: ['C'],
    E: ['D'],
    F: ['B0','B1','B2'],
    G: ['F'],
    H: ['G','E'],
    I: ['H']
  }
  t.plan(1 + Object.keys(links).length)

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
      var cs = cons.map(function (hash) { return names[hash] }).sort()
      t.deepEqual(cs, [ 'B0', 'B1', 'B2' ])
    })
  }
})
