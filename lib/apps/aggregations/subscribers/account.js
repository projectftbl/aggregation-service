var log = require('@ftbl/log')
  , Aggregator = require('../services/aggregator');

var Subscriber = function(queue) {
  if (this instanceof Subscriber === false) return new Subscriber(queue);

  this.queue = queue;
};

var logError = function(err) {
  log.error(err.message, err.stack);
};

Subscriber.prototype.subscribe = function() {
  this.queue.on('data', function(accountId, options) {
    new Aggregator(options).aggregate(accountId).catch(logError);
  });

  this.queue.on('error', logError);

  this.queue.subscribe('aggregate:account');
};

module.exports = Subscriber;
