'use strict'

const max = 50000
const iterations = 5

function bench (name, func, callback) {
  const times = []
  let currentIteration = 0

  function runIteration () {
    if (currentIteration >= iterations) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      const min = Math.min(...times)
      const max = Math.max(...times)
      console.log(`${name}:`)
      console.log(`  Average: ${avg.toFixed(2)}ms`)
      console.log(`  Min: ${min.toFixed(2)}ms`)
      console.log(`  Max: ${max.toFixed(2)}ms`)
      console.log(`  Ops/sec: ${(max / (avg / 1000)).toFixed(0)}`)
      console.log('')
      return callback()
    }

    let count = -1
    const start = process.hrtime.bigint()

    function end () {
      if (++count < max) {
        func(end)
      } else {
        const elapsed = process.hrtime.bigint() - start
        const ms = Number(elapsed) / 1000000
        times.push(ms)
        currentIteration++
        setImmediate(runIteration)
      }
    }

    end()
  }

  runIteration()
}

// Test 1: Baseline setImmediate
function benchSetImmediate (cb) {
  setImmediate(cb)
}

// Test 2: Queue operations
const fastqueue = require('./')
const queue1 = fastqueue(function (arg, cb) {
  setImmediate(cb)
}, 1)

function benchQueueConcurrency1 (done) {
  queue1.push(42, done)
}

// Test 3: Higher concurrency
const queue4 = fastqueue(function (arg, cb) {
  setImmediate(cb)
}, 4)

function benchQueueConcurrency4 (done) {
  queue4.push(42, done)
}

// Test 4: Length operations (optimized with cached counter)
const queueLength = fastqueue(function (arg, cb) {
  setImmediate(cb)
}, 1)

function benchQueueLength (done) {
  queueLength.push(42, done)
  const len = queueLength.length()
  if (len < 0) console.log('never happens')
}

console.log('=== Fastq Optimization Benchmark ===')
console.log(`Iterations: ${iterations} x ${max} operations`)
console.log('')

bench('Baseline (setImmediate)', benchSetImmediate, function () {
  bench('Queue (concurrency=1)', benchQueueConcurrency1, function () {
    bench('Queue (concurrency=4)', benchQueueConcurrency4, function () {
      bench('Queue with length() calls', benchQueueLength, function () {
        console.log('=== Benchmark Complete ===')
      })
    })
  })
})
