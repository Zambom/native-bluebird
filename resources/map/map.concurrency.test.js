const { expect } = require("chai")
const { delay } = require("../utils")
const map = require(".")

describe('Testing map function wit concurrency', function () {
  const options = { concurrency: 2 }

  function mapper (val) {
    return val * 2
  }

  function deferredMapper (val) {
    return delay(1, mapper(val))
  }

  it('Should map input values array with concurrency', function () {
    const input = [1, 2, 3]

    return map(input, mapper, options).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })
  
  it('Should map input promises array with concurrency', function () {
    const input = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ]

    return map(input, mapper, options).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should map mixed input array with concurrency', function () {
    const input = [1, Promise.resolve(2), 3]

    return map(input, mapper, options).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should map input when mapper returns a promise with concurrency', function () {
    const input = [1, 2, 3]

    return map(input, deferredMapper, options).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should accept a promise for an array with concurrency', function () {
    return map(Promise.resolve([1, Promise.resolve(2), 3]), mapper, options).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should throw a TypeError when input promise does not resolve to an array with concurrency', function () {
    return map(Promise.resolve(123), mapper, options).catch(
      function (e) {
        expect(e).to.be.an.instanceOf(TypeError)
      }
    )
  })

  it('Should map input promises when mapper returns a promise with concurrency', function () {
    const input = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ]

    return map(input, deferredMapper, options).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should reject when input contains rejection with concurrency', function () {
    const input = [
      Promise.resolve(1),
      Promise.reject(2),
      Promise.resolve(3)
    ]

    return map(input, mapper, options).then(
      expect.fail,
      function (results) {
        expect(results).to.deep.equal(2)
      }
    )
  })

  it('Should not have more than {concurrency} promises in flight', function () {
    const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const b = []

    const immediates = []
    function immediate (index) {
      let resolve
      const ret = new Promise(function () {
        resolve = arguments[0]
      })
      immediates.push([ret, resolve, index])
      return ret
    }

    const lates = []
    function late (index) {
      let resolve
      const ret = new Promise(function () {
        resolve = arguments[0]
      })
      lates.push([ret, resolve, index])
      return ret
    }

    function promiseByIndex (index) {
      return index < 5 ? immediate(index) : late(index)
    }

    function resolve (item) {
      item[1](item[2])
    }

    const ret1 = map(array, function (value, index) {
      return promiseByIndex(index).then(function () {
        b.push(value)
      })
    }, { concurrency: 5 })

    const ret2 = delay(100).then(function () {
      expect(b.length).to.be.equal(0)

      immediates.forEach(resolve)

      return immediates.map(function (item) {
        return item[0]
      })
    }).then(async function () {
      await delay(100)

      expect(b).to.deep.equal([0, 1, 2, 3, 4])

      lates.forEach(resolve)
    }).then(async function () {
      await delay(100)

      expect(b).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

      lates.forEach(resolve)
    }).then(async function () {
      await ret1

      expect(b).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    return Promise.all([ret1, ret2])
  })
})