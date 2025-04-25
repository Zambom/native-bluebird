const { evaluatePromise, handlePromisesRejection } = require("../utils");

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
  try {
    // Awaiting the resolve of a possible promise for the iterable
    const targetIterable = await evaluatePromise(iterable);

    // Making sure that the iterable is in fact an iterable
    if (typeof targetIterable[Symbol.iterator] !== "function") {
      throw new TypeError("Filter target is not an iterable.");
    }

    // Making sure that the filterer function is in fact a function
    if (typeof filterer !== "function") {
      throw new TypeError("Filterer is not a function");
    }

    // Setting up the concurrency limit
    const concurrency =
      options.concurrency || targetIterable.length || targetIterable.size;

    const predicates = [];
    const values = [];

    // Always have up to 'concurrency' promises running simultaneously
    async function processAll() {
      let nextIndex = 0;
      const promises = [];
      const items = [];

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
            // Adding the iterable item in auxiliar array
            values[pos] = item;

            // Adding the result of the predicate for the item
            predicates[pos] = await filterer(item, pos);
          } catch (err) {
            handlePromisesRejection([{ status: "rejected", reason: err }]);
          }
        }
      }

      for (let i = 0; i < concurrency && i < total; i++) {
        promises.push(worker());
      }

      await Promise.all(promises);
    }

    await processAll();

    // Filtering the iterable items with the predicates results
    return values.filter((v, i) => predicates[i]);
  } catch (err) {
    throw err;
  }
}

module.exports = filter;
