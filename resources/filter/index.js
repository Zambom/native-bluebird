const { evaluatePromise } = require("../utils")

/**
 * Asynchronously filters an iterable based on a predicate function with a concurrency limit
 * It actually maps all the items of the iterable to a boolean value e them uses standard array filter
 * 
 * @param {Iterable|Promise<Array>} iterable - The iterable to filter
 * @param {Function} mapper - The asynchronous predicate function
 * @param {Object} [options={}] - Optional settings
 * @param {number} [options.concurrency=Iterable.length] - The maximum number of concurrent promises. It defaults to the iterable size
 * @returns {Promise<Array>} A promise that resolves to an array containing the elements that pass the predicate function
 * @throws {TypeError} If the provided iterable is not an iterable or the filterer function is not a function
 */
async function filter(iterable, filterer, options = {}) {
  // Awaiting the resolve of a possible promise for the iterable
  const targetIterable = await evaluatePromise(iterable)

  // Making sure that the iterable is in fact an iterable
  if (typeof targetIterable[Symbol.iterator] !== 'function') {
    throw new TypeError('Filter target is not an iterable.')
  }

  // Making sure that the filterer function is in fact a function
  if (typeof filterer !== 'function') {
    throw new TypeError('Filterer is not a function')
  }

  // Setting up the concurrency limit
  const concurrency = options.concurrency || targetIterable.length || targetIterable.size

  let index = 0
  const iterator = targetIterable[Symbol.iterator]()
  const predicates = []
  const values = []

  // Function to process the batches
  async function processBatch (batch) {
    const promises = batch.map(async ([item, pos]) => {
      // Adding the iterable item in auxiliar array
      values[pos] = item
      // Adding the result of the predicate for the item
      predicates[pos] = await filterer(item, pos)
    })

    // Waiting for all promises in the batch to resolve
    await Promise.all(promises)
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

  // Filtering the iterable items with the predicates results
  return values.filter((v, i) => predicates[i])
}

module.exports = filter