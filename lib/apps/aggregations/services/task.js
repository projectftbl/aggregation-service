var _ = require('lodash')
  , log = require('@ftbl/log')
  , utility = require('@ftbl/utility');

var Task = function() {
  if (this instanceof Task === false) return new Task(context);

  this.tasks = {};
};

Task.prototype.schedule = function(id, delay, done) {
  this.stop(id);

  this.tasks[id] = new utility.Timer(delay, done);
};

Task.prototype.stop = function(id) {
  if (this.tasks.hasOwnProperty(id)) {
    this.tasks[id].stop();
    delete this.tasks[id];
    return true;
  }
};

Task.prototype.log = function() {
  _.forOwn(this.tasks, function(timeout, id) {
    log.info(process.pid, id, timeout.remaining() + 's');
  });
};

module.exports = new Task;