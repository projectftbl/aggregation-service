var log = require('@ftbl/log')
  , Startup = require('../services/startup');

var Subscriber = function(queue) {
  if (this instanceof Subscriber === false) return new Subscriber(queue);

  this.queue = queue;
};

var logError = function(err) {
  log.error(err.message, err.stack);
};

Subscriber.prototype.subscribe = function() {
  this.queue.on('data', function(memberId, options) {
    new Startup(options).member(memberId).catch(logError);
  });

  this.queue.on('error', logError);

  this.queue.subscribe('aggregate:member');
};

module.exports = Subscriber;
