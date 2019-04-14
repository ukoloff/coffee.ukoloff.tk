// Queue for node-fetch
const https = require('https')

const fetch = require('node-fetch')

// https://stackoverflow.com/a/40639733
https.globalAgent.keepAlive = true
/* https.globalAgent.maxSockets = 5 */ // Force node-fetch to silently die

module.exports = queue

function queue(count) {
  var queue = []

  return append

  function append(url) {
    return new Promise(resolve =>
      count
        ? (count-- , resolve(url))
        : queue.push(_ => resolve(url)))
      .then(fetch)
      .then(resolve, reject)
  }

  function resolve(value) {
    dec()
    return value
  }

  function reject(error) {
    dec()
    return Promise.reject(error)
  }

  function dec() {
    if (queue.length) {
      queue.shift()()
    } else {
      count++
    }
  }
}
