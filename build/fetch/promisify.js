module.exports = promisify


function promisify(fn) {
  return promiser

  function promiser(...args) {
    return new Promise(executor)

    function executor(resolve, reject) {
      fn(...args, callback)

      function callback(error, value) {
        if (error) {
          reject(error)
        } else {
          resolve(value)
        }
      }
    }
  }
}
