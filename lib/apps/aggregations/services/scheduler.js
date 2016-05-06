var Promise = require('bluebird')
  , moment = require('moment')
  , publish = require('@ftbl/task').publish
  , request = require('@ftbl/request')
  , getAccount = require('./account')
  , Task = require('./task')
  , Recorder = require('./recorder');

var Scheduler = function(context) {
  if (this instanceof Scheduler === false) return new Scheduler(context);

  this.context = context;
  this.record = new Recorder(context);
};

var nothing = Promise.cast;

var run = Promise.method(function(account) {
  Task.stop(account.id);
  publish('aggregate:account', account.id, this.context);
});

var running = function(account) {
  return this.record.isRunning(account.id).then(function(isRunning) {
    if (isRunning) return;

    return run.call(this, account);
  }.bind(this));
};

var scheduled = function(account, aggregation) {
  var runAt = aggregation.data.runAt;

  if (runAt > new Date) return schedule.call(this, account, null, runAt);

  return run.call(this, account);
};

var schedule = function(account, aggregation, runAt) {
  if (runAt == null) runAt = moment().add(account.schedule, 'minutes').toDate();
  
  var that = this
    , delay = moment(runAt).diff(moment());

  Task.schedule(account.id, delay, function() {
    run.call(that, account);
  });

  return this.record.scheduled(account.id, runAt);
};

var next = function(account, aggregation) {
  var NEXT = {
    missing:    schedule
  , running:    running
  , scheduled:  scheduled
  , complete:   schedule
  , cancelled:  nothing
  };

  return NEXT[aggregation.status].call(this, account, aggregation);
};

Scheduler.prototype.cancel = function(accountId) {
  if (Task.stop(accountId)) {
    return this.record.cancelled(accountId, this.context.session.id);
  }
};

Scheduler.prototype.schedule = function(accountId) {
  var that = this;
  
  return getAccount(accountId, this.context).then(function(account) {
    if (account == null || account.schedule == null) return;

    return that.record.latest(accountId).then(function(aggregation) {
      return next.call(that, account, aggregation);
    });
  });
};

module.exports = Scheduler;