var log = require('@ftbl/log')
  , Recorder = require('../services/recorder');

var Subscriber = function(queue) {
  if (this instanceof Subscriber === false) return new Subscriber(queue);

  this.queue = queue;
};

var logError = function(err) {
  log.error('aggregate:published: ' + err.message, err.stack);
};

Subscriber.prototype.subscribe = function() {
  this.queue.on('data', function(data, options) {
    new Recorder(options).published(data.accountId, data.timestamp).catch(logError);
  });

  this.queue.on('error', logError);

  this.queue.subscribe('aggregate:published');
};

module.exports = Subscriber;
