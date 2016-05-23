var log = require('@ftbl/log')
  , Scheduler = require('../services/scheduler')
  , Aggregator = require('../services/aggregator');

var Subscriber = function(queue) {
  if (this instanceof Subscriber === false) return new Subscriber(queue);

  this.queue = queue;
};

var logError = function(err) {
  log.error('aggregate:account: ' + err.message, err.stack);
};

Subscriber.prototype.subscribe = function() {
  this.queue.on('data', function(accountId, options) {
    new Aggregator(options).aggregate(accountId).catch(function(err) {
      logError(err);

      new Scheduler(options).schedule(accountId, { force: true });
    });
  });

  this.queue.on('error', logError);

  this.queue.subscribe('aggregate:account');
};

module.exports = Subscriber;
