var log = require('@ftbl/log')
  , Scheduler = require('../services/scheduler');

var Subscriber = function(queue) {
  if (this instanceof Subscriber === false) return new Subscriber(queue);

  this.queue = queue;
};

var logError = function(err) {
  log.error('aggregate:schedule: ' + err.message, err.stack);
};

Subscriber.prototype.subscribe = function() {
  this.queue.on('data', function(accountId, options) {
    var scheduler = new Scheduler(options);

    scheduler.schedule(accountId).catch(function(err) {
      logError(err);

      scheduler.schedule(accountId, { force: true });
    });
  });

  this.queue.on('error', logError);

  this.queue.subscribe('aggregate:schedule');
};

module.exports = Subscriber;
