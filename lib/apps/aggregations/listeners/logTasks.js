var log = require('@ftbl/log')
  , Task = require('../services/task');

var Listener = function(queue) {
  if (this instanceof Listener === false) return new Listener(queue);

  this.queue = queue;
};

var logError = function(err) {
  log.error('aggregate:log: ' + err.message, err.stack);
};

Listener.prototype.listen = function() {
  this.queue.on('data', function() {
    Task.log();
  });

  this.queue.on('error', logError);

  this.queue.listen('aggregate:log');
};

module.exports = Listener;
