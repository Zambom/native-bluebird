const { expect } = require("chai")
const filter = require(".")

describe('Testing filter function', function () {
  const arr = [1, 2, 3]

  it('Should accept eventual booleans immediately fulfilled', function () {
    return filter(arr, function (v) {
      return new Promise(function (r) {
        r(v !== 2)
      })
    }).then(function (result) {
      expect(result).to.have.lengthOf(2)
      expect(result).to.be.deep.equal([1, 3])
    }) 
  })
  
  it('Should accept eventual booleans already fulfilled', function () {
    return filter(arr, function (v) {
      return Promise.resolve(v !== 2)
    }).then(function (result) {
      expect(result).to.have.lengthOf(2)
      expect(result).to.be.deep.equal([1, 3])
    }) 
  })
  
  it('Should accept eventual booleans eventually fulfilled', function () {
    return filter(arr, function (v) {
      return new Promise(function (r) {
        setTimeout(function () {
          r(v !== 2)
        }, 1)
      })
    }).then(function (result) {
      expect(result).to.have.lengthOf(2)
      expect(result).to.be.deep.equal([1, 3])
    }) 
  })
})

