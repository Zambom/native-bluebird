const { evaluatePromise } = require("../utils")

/**
 * Asynchronously maps an iterable to a new array using a mapping function with a concurrency limit
 * 
 * @param {Iterable|Promise<Array>} iterable - The iterable to map
 * @param {Function} mapper - The asynchronous map function
 * @param {Object} [options={}] - Optional settings
 * @param {number} [options.concurrency=Iterable.length] - The maximum number of concurrent promises. It defaults to the iterable size
 * @returns {Promise<Array>} A promise that resolves to an array containing the results of the mapping
 * @throws {TypeError} If the provided iterable is not an iterable or the mapper function is not a function
 */
async function map(iterable, mapper, options = {}) {
  // Awaiting the resolve of a possible promise for the iterable
  const targetIterable = await evaluatePromise(iterable)

  // Making sure that the iterable is in fact an iterable
  if (typeof targetIterable[Symbol.iterator] !== 'function') {
    throw new TypeError('Map target is not an iterable.')
  }

  // Making sure that the mapper function is in fact a function
  if (typeof mapper !== 'function') {
    throw new TypeError('Mapper transformation is not a function')
  }

  // Setting up the concurrency limit
  const concurrency = options.concurrency || targetIterable.length || targetIterable.size

  let index = 0
  const iterator = targetIterable[Symbol.iterator]()
  const results = new Map()

  // Function to process the batches
  async function processBatch (batch) {
    const promises = []
    
    for (const [item, pos] of batch) {
      promises.push(new Promise(async (resolve, reject) => {
        results.set(pos, await mapper(item, pos))
        resolve()
      }))
    }

    // Waiting for all promises in the batch to resolve
    await Promise.allSettled(promises)
  }

  // Divide the iterable in batches of concurrency sizes
  async function processAll () {
    const batch = []

    while (true) {
      // Getting the next value in iterable
      const { done, value } = iterator.next()

      // Exit the loop when we are done
      if (done && batch.length === 0) {
        break
      }

      if (!done) {
        // Await the resolve of a possible promise for the iterable item
        const item = await evaluatePromise(value)
        // Putting the value in the batch
        batch.push([item, index++])

        if (batch.length >= concurrency) {
          // Processing the batch and cleaning it before start creating a new batch
          await processBatch(batch)
          batch.length = 0
        }
      } else if (batch.length > 0) {
        // Processing the last batch and cleaning it
        await processBatch(batch)
        batch.length = 0
      }
    }
  }

  await processAll()

  // Getting sorted values from the Map
  return Array.from([...results].sort((a, b) => a[0] - b[0]), (value, index) => value[1])
}

module.exports = map