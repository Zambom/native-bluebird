const { expect } = require("chai");
const { delay } = require("../utils");
const map = require(".");

describe("map error and rejection scenarios", function () {
  function erroringMapper(val) {
    if (val === "bad") throw new Error("Sync error!");
    return val * 2;
  }

  function asyncErroringMapper(val) {
    if (val === "bad") return Promise.reject(new Error("Async error!"));
    return delay(1, val * 2);
  }

  it("Should reject if one of the input promises rejects", function () {
    const input = [Promise.resolve(1), Promise.reject(new Error("fail")), 3];
    return map(input, (v) => v * 2).then(
      () => expect.fail("Should have rejected"),
      (err) => expect(err.message).to.match(/fail/)
    );
  });

  it("Should reject if the mapper throws synchronously", function () {
    const input = [1, "bad", 3];

    return map(input, erroringMapper).then(
      () => expect.fail("Should have rejected"),
      (err) => expect(err.message).to.match(/Sync error/)
    );
  });

  it("Should reject if the mapper returns a rejected promise (async error)", function () {
    const input = [1, "bad", 3];

    return map(input, asyncErroringMapper).then(
      () => expect.fail("Should have rejected"),
      (err) => expect(err.message).to.match(/Async error/)
    );
  });

  it("Should reject if multiple errors occur (first error wins)", function () {
    const input = ["bad", Promise.reject(new Error("fail2")), 3];

    return map(input, asyncErroringMapper).then(
      () => expect.fail("Should have rejected"),
      (err) => expect(err).to.be.an("error")
    );
  });

  it("Should reject with error when using concurrency and one item fails", function () {
    const input = [1, 2, "bad", 4, 5];

    return map(input, asyncErroringMapper, { concurrency: 2 }).then(
      () => expect.fail("Should have rejected"),
      (err) => expect(err.message).to.match(/Async error/)
    );
  });
});
