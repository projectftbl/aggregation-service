var log = require('@ftbl/log')
  , Scheduler = require('../services/scheduler');

var Listener = function(queue) {
  if (this instanceof Listener === false) return new Listener(queue);

  this.queue = queue;
};

var logError = function(err) {
  log.error(err.message, err.stack);
};

Listener.prototype.listen = function() {
  this.queue.on('data', function(accountId, options) {
    new Scheduler(options).cancel(accountId);
  });

  this.queue.on('error', logError);

  this.queue.listen('aggregate:cancel');
};

module.exports = Listener;
