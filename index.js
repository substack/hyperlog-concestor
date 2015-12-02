var uniq = require('uniq')
var has = require('has')

module.exports = function (log, hashes, cb) {
  var seen = {}
  var seenh = {}
  var hs = hashes.map(function (h) { return [h] })
  hashes.forEach(function (h, ix) {
    seenh[ix] = {}
  })

  ;(function next (hashes) {
    var results = null 
    for (var i = 0; i < hashes.length; i++) {
      var hs = hashes[i]
      for (var j = 0; j < hs.length; j++) {
        var hash = hs[j]
        if (!has(seenh[i], hash)) {
          seenh[i][hash] = true
          seen[hash] = (seen[hash] || 0) + 1
        }
        if (seen[hash] === hashes.length) {
          if (!results) results = []
          results.push(hash)
        }
      }
    }
    if (results && results.length) return cb(null, uniq(results))

    var pending = 0
    var prev = []

    hashes.forEach(function (hs, ix) {
      pending += hs.length
      prev[ix] = []
      hs.forEach(function (hash) {
        log.get(hash, function (err, value) {
          if (value && Array.isArray(value.links)) {
            prev[ix].push.apply(prev[ix], value.links)
          }
          if (-- pending === 0) next(prev)
        })
      })
    })
    if (pending === 0) return cb(null, [])
  })(hs)
}
