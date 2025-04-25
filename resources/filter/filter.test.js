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

describe('Testing filter with promised items in input array', function () {
  it('Should filter an array of promises', function () {
    const arr = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    return filter(arr, v => v !== 2).then(result => {
      expect(result).to.have.lengthOf(2);
      expect(result).to.deep.equal([1, 3]);
    });
  });

  it('Should filter a mixed array of values and promises', function () {
    const arr = [1, Promise.resolve(2), 3];
    return filter(arr, v => v !== 2).then(result => {
      expect(result).to.have.lengthOf(2);
      expect(result).to.deep.equal([1, 3]);
    });
  });

  it('Should reject if any item promise rejects', function () {
    const arr = [1, Promise.reject(new Error('fail')), 3];
    return filter(arr, v => v !== 2)
      .then(() => { throw new Error('Expected rejection'); })
      .catch(err => {
        expect(err).to.be.an('error');
        expect(err.message).to.equal('fail');
      });
  });
});
