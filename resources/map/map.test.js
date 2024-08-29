const { expect } = require("chai")
const { delay } = require("../utils")
const map = require(".")

describe('Testing map function without concurrency', function () {
  function mapper (val) {
    return val * 2
  }

  function deferredMapper (val) {
    return delay(1, mapper(val))
  }

  it('Should map input values array', function () {
    const input = [1, 2, 3]

    return map(input, mapper).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should map input promises array', function () {
    const input = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ]

    return map(input, mapper).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should map mixed input array', function () {
    const input = [
      1,
      Promise.resolve(2),
      3
    ]

    return map(input, mapper).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should map input when mapper returns a promise', function () {
    const input = [1, 2, 3]

    return map(input, deferredMapper).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should accept a promise for an array', function () {
    return map(Promise.resolve([1, Promise.resolve(2), 3]), mapper).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should throw a TypeError when input promise does not resolve to an array', function () {
    return map(Promise.resolve(123), mapper).catch(
      function (e) {
        expect(e).to.be.an.instanceOf(TypeError)
      }
    )
  })

  it('Should map input promises when mapper returns a promise', function () {
    const input = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ]

    return map(input, deferredMapper).then(
      function (results) {
        expect(results).to.deep.equal([2, 4, 6])
      },
      expect.fail
    )
  })

  it('Should reject when input contains rejection', function () {
    const input = [
      Promise.resolve(1),
      Promise.reject(2),
      Promise.resolve(3)
    ]

    return map(input, mapper).then(
      expect.fail,
      function (results) {
        expect(results).to.deep.equal(2)
      }
    )
  })

  it('Should call mapper asynchronously on values array', function () {
    let calls = 0

    function mapper (val) {
      calls++
    }

    const input = [1, 2, 3]
    const p = map(input, mapper)

    expect(calls).to.be.equal(0)

    return p.then(function () {
      expect(calls).to.be.equal(3)
    })
  })

  it('Should call mapper asynchronously on promises array', function () {
    let calls = 0

    function mapper (val) {
      calls++
    }

    const input = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ]
    const p = map(input, mapper)

    expect(calls).to.be.equal(0)

    return p.then(function () {
      expect(calls).to.be.equal(3)
    })
  })
  
  it('Should call mapper asynchronously on mixed array', function () {
    let calls = 0

    function mapper (val) {
      calls++
    }

    const input = [
      1,
      Promise.resolve(2),
      3
    ]
    const p = map(input, mapper)

    expect(calls).to.be.equal(0)

    return p.then(function () {
      expect(calls).to.be.equal(3)
    })
  })
})