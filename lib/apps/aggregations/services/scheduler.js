var _ = require('lodash')
  , log = require('@ftbl/log')
  , Promise = require('bluebird')
  , moment = require('moment')
  , publish = require('@ftbl/task').publish
  , request = require('@ftbl/request')
  , getAccount = require('./account')
  , Task = require('./task')
  , Finder = require('./finder')
  , Recorder = require('./recorder');

var DELAY = 15;

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
  // if (runAt == null) runAt = moment().add(0.5, 'minutes').toDate();
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
  , schedule:   schedule
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

Scheduler.prototype.schedule = function(accountId, options) {
  var that = this
    , opts = _.assign({}, { force: false }, options || {});

  return getAccount(accountId, this.context)

  .then(function(account) {
    if (account == null || account.schedule == null) return;
    if (opts.force) return next.call(that, account, { status: 'schedule' });

    return new Finder(that.context).latest(accountId).then(function(aggregation) {
      return next.call(that, account, aggregation);
    });
  })

  .catch(function(err) {
    return next.call(that, { id: accountId, schedule: DELAY }, { status: 'schedule' });
  });
};

module.exports = Scheduler;
