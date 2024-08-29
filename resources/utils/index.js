/**
 * Await for a possible promise to resolve and return it's values
 * @param {any|Promise} maybePromisse 
 * @returns {any} the promise value after it resolves
 */
async function evaluatePromise (maybePromisse) {
  if (maybePromisse instanceof Promise) {
    return await maybePromisse
  }

  return maybePromisse
}

/**
 * Waits for a certain time before handles the value passed
 * @param {number} duration time to wait before resolving the value, in ms
 * @param {any} value 
 * @returns {Promise} a promise that will only be resolved after {duration}
 */
async function delay (duration, value) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value)
    }, duration)
  })
}

module.exports = { evaluatePromise, delay }