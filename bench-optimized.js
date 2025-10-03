'use strict'

const max = 100000
const fastqueue = require('./')(worker, 1)

function bench (func, done) {
  const key = max + '*' + func.name
  let count = -1

  const start = process.hrtime.bigint()
  end()

  function end () {
    if (++count < max) {
      func(end)
    } else {
      const elapsed = process.hrtime.bigint() - start
      const ms = Number(elapsed) / 1000000
      console.log(key + ': ' + ms.toFixed(2) + 'ms')
      if (done) {
        done()
      }
    }
  }
}

function benchFastQ (done) {
  fastqueue.push(42, done)
}

function worker (arg, cb) {
  setImmediate(cb)
}

function benchSetImmediate (cb) {
  worker(42, cb)
}

console.log('Running optimized benchmarks...')
bench(benchSetImmediate, function () {
  bench(benchFastQ, function () {
    console.log('Benchmarks complete')
  })
})
