# native-bluebird

> Implementation of Bluebird's functionalities using native promises

## Introduction

[Bluebird](https://github.com/petkaantonov/bluebird) is a powerfull promise package, known for its performance and innovative features. But unfortunetly, as stated in it's README page, it won't be receiving more updates and it's authors recommends use of Node.js Native Promises whenever is possible.

Based on that statement, this package aims to condensate equivalent native promises implementations of some of the Bluebird's functionalities.

As of this day, this package has implementations of `map`, `filter` and a simpler version of `delay` that doesn't consider promises cancelation.

## Installation

```
npm i native-bluebird
```

## Usage

The usage of the functions in this package are similar to its Bluebird's counterparts, with the same signature and mostly the same behaviour, so the transition shouldn't be complex.

### Map function
```js
import { map } from 'native-bluebird'

const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const result = await map(array, function (item) {
    return item * 2
}, { concurrency: 2 })

console.log(result) // [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
```

### Filter function
```js
import { filter } from 'native-bluebird'

const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const result = await filter(array, function (item) {
    return item % 2 === 0
}, { concurrency: 2 })

console.log(result) // [2, 4, 6, 8, 10]
```