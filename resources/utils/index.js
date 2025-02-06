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

/**
 * Checks the fulfillment of a list of promises and throws an error
 * if at least one of them has been rejected
 * @param {Array} promiseFulfills promises fulfillments
 * @throws {Error} the cause of promise rejection
 */
function handlePromisesRejection (promiseFulfills) {
  const rejection = promiseFulfills?.find(fulfill => fulfill.status === 'rejected')

  // If none of promises reject, do nothing
  if (!rejection) {
    return
  }

  let error = rejection.reason

  // Check if reason is not an instance of Error already
  // Creates one if it's the case
  if (!(error instanceof Error)) {
    error = new Error(`Error while performing array async operation cause by: ${error}`)
  }

  // Propagates the erro to higher levels in call stack
  throw error
}

module.exports = { evaluatePromise, delay, handlePromisesRejection }