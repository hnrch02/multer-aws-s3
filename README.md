# multer-aws-s3

AWS S3 storage engine for multer.

## Installation

```sh
$ npm install --save multer-aws-s3
```

## Basic Usage

```javascript
var multer = require('multer')
var AWS = require('aws-sdk')
var S3Storage = require('multer-aws-s3')

// AWS setup here...

var upload = multer({
  storage: new S3Storage({
    basepath: '/remote/path',
    s3: new AWS.S3({ params: { Bucket: 'myBucket' } })
  })
})
```

## Different filenames

By default random filenames are chosen (`crypto.randomBytes`), you can change this behavior however by using a custom `destination` function:

```javascript
// Demonstrates destination that uses sha1 digest of file
var multer = require('multer')
var crypto = require('crypto')
var AWS = require('aws-sdk')
var S3Storage = require('multer-aws-s3')

var upload = multer({
  storage: new S3Storage({
    destination: function (req, file, options, callback) {
      var digest = crypto.createHash('sha1')

      digest.setEncoding('hex')

      file.stream.pipe(digest)

      file.stream.on('end', function () {
        digest.end()
        callback(null, digest.read())
      })
    },
    s3: new AWS.S3({ params: { Bucket: 'myBucket' } })
  })
})
```

## Advanced usage

```javascript
var multer = require('multer')
var AWS = require('aws-sdk')
var S3Storage = require('multer-aws-s3')

var upload = multer({
  storage: new S3Storage({
    basepath: '/remote/path', // base path for keys in the bucket
    s3: new AWS.S3({ params: { Bucket: 'myBucket' } }), // `aws-sdk` S3 instance
    destination: function (req, file, options, callback) {
      callback(null, 'testfilename') // custom file destination, file extension is added to the end of the path
    },
    transformFile: function (req, file, callback) {
      // transform the file before uploading it
      //   file.stream is a ReadableStream of the file
      //   callback(error, < ReadableStream | Buffer | String >)
      callback(null, file.stream)
    }
  })
})
```

## Todo

Write tests

## License

[MIT](LICENSE)