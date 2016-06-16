var Promise = require('bluebird')
var path = require('path')
var defaults = require('lodash.defaults')
var random = Promise.promisify(require('crypto').randomBytes)
var mime = require('mime-types')

function getDestination (req, file, opts, cb) {
  random(16).then(function(raw) {
    cb(null, path.join(opts.basepath, raw.toString('hex') + path.extname(file.originalname)))
  }, cb)
}

function S3Storage (opts) {
  this.opts = defaults(opts, {
    basepath: '',
    destination: getDestination
  })

  this.s3 = opts.s3
}

S3Storage.prototype._handleFile = function _handleFile (req, file, cb) {
  var instance = this

  function handleFile (stream) {
    instance.opts.destination(req, file, instance.opts, function (err, destination) {
      if (err) return cb(err)

      instance.s3.upload({ Body: stream, Key: destination, ContentType: mime.lookup(file.originalname) || 'application/octet-stream' }, function (err, data) {
        if (err) return cb(err)

        cb(null, {
          path: destination
        })
      })
    })
  }

  if (instance.opts.transformFile) {
    instance.opts.transformFile(req, file, function (err, stream) {
      if (err) return cb(err)

      file.transformedStream = stream

      handleFile(file.transformedStream)
    })
  } else {
    handleFile(file.stream)
  }
}

S3Storage.prototype._removeFile = function _removeFile(req, file, cb) {
  this.s3.deleteObject({ Key: file.path }, cb)
}

module.exports = S3Storage