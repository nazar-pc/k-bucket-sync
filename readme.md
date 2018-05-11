# k-bucket-sync [![Travis CI](https://img.shields.io/travis/nazar-pc/k-bucket-sync/master.svg?label=Travis%20CI)](https://travis-ci.org/nazar-pc/k-bucket-sync)
Synchronous and efficient implementation of k-bucket from Kademlia DHT.

Simplified, synchronous, arguably more efficient implementation based on https://github.com/tristanls/k-bucket and https://github.com/PolkaJS/dht-bucket.

Tests were taken from https://github.com/tristanls/k-bucket/tree/master/test (Copyright (c) Tristan Slominski, MIT License) and modified according to new API.

## How to install
```
npm install k-bucket-sync
```

## How to use
Node.js:
```javascript
var k_bucket_sync = require('k-bucket-sync')

// Do stuff
```
Browser:
```javascript
requirejs(['k-bucket-sync'], function (k_bucket_sync) {
    // Do stuff
})
```

## API
### k_bucket_sync(id : ArrayBufferView, bucket_size : number) : k_bucket_sync
Constructor, creates k-bucket for specified local ID and bucket size (from Kademlia design).

### k_bucket_sync.set(id : ArrayBufferView, data = null, on_full = null : Function) : boolean
Add new node with specified ID and associated data or move node to the most recently used and update data if node already exists.

Returns `true` if succeeded, and `false` if there is no more space in the bucket (in this case optional `on_full` callback will be called with an array of node IDs in that bucket).

### k_bucket_sync.get_all() : Array
Get an array IDs of all of the nodes previously added in the same order as they appear in buckets tree.

### k_bucket_sync.get_data(id : ArrayBufferView) : *
Get associated data for previously added node.

### k_bucket_sync.has(id : ArrayBufferView) : boolean
Check whether `id` node exists in k-bucket.

### k_bucket_sync.del(id : ArrayBufferView)
Delete previously added node.

### k_bucket_sync.count() : number
Get total number of nodes previously added.

### k_bucket_sync.closest(id : ArrayBufferView, number = Infinity : number) : ArrayBufferView[]
Get `number` IDs of nodes closest to `id`.

## Contribution
Feel free to create issues and send pull requests (for big changes create an issue first and link it from the PR), they are highly appreciated!

When reading LiveScript code make sure to configure 1 tab to be 4 spaces (GitHub uses 8 by default), otherwise code might be hard to read.

## License
Free Public License 1.0.0 / Zero Clause BSD License

https://opensource.org/licenses/FPL-1.0.0

https://tldrlegal.com/license/bsd-0-clause-license
