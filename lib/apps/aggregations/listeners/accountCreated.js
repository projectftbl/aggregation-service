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
  this.queue.on('data', function(account, options) {
    new Scheduler(options).schedule(account.id).catch(logError);
  });

  this.queue.on('error', logError);

  this.queue.listen('member:account');
};

module.exports = Listener;
