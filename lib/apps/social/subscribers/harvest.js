var log = require('@ftbl/log')

var Subscriber = function(queue) {
  if (this instanceof Subscriber === false) return new Subscriber(queue);

  this.queue = queue;
};

var logError = function(err) {
  log.error(err.message, err.stack);
};

Subscriber.prototype.subscribe = function() {
  this.queue.on('data', function(data, options) {
    require('../providers/' + data.type)(data, options);
  });

  this.queue.on('error', logError);

  this.queue.subscribe('members:harvest');
};

module.exports = Subscriber;