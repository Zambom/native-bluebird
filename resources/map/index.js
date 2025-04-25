const { evaluatePromise, handlePromisesRejection } = require("../utils");

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
  try {
    // Awaiting the resolve of a possible promise for the iterable
    const targetIterable = await evaluatePromise(iterable);

    // Making sure that the iterable is in fact an iterable
    if (typeof targetIterable[Symbol.iterator] !== "function") {
      throw new TypeError("Map target is not an iterable.");
    }

    // Making sure that the mapper function is in fact a function
    if (typeof mapper !== "function") {
      throw new TypeError("Mapper transformation is not a function");
    }

    // Setting up the concurrency limit
    const concurrency =
      options.concurrency || targetIterable.length || targetIterable.size;

    const results = new Map();

    // Always have up to 'concurrency' promises running simultaneously
    async function processAll() {
      let nextIndex = 0;
      const promises = [];
      const items = [];

      // Preload all items and their indices
      for (const value of targetIterable) {
        items.push([value, nextIndex++]);
      }

      const total = items.length;
      let cursor = 0;

      async function worker() {
        while (cursor < total) {
          const [rawItem, pos] = items[cursor++];
          const item = await evaluatePromise(rawItem);
          try {
            results.set(pos, await mapper(item, pos));
          } catch (err) {
            // Use the same rejection handler as before
            handlePromisesRejection([{ status: "rejected", reason: err }]);
          }
        }
      }

      // Start up to 'concurrency' workers
      for (let i = 0; i < concurrency && i < total; i++) {
        promises.push(worker());
      }

      await Promise.all(promises);
    }

    await processAll();

    // Getting sorted values from the Map
    return Array.from(
      [...results].sort((a, b) => a[0] - b[0]),
      (value, index) => value[1]
    );
  } catch (err) {
    throw err;
  }
}

module.exports = map;
