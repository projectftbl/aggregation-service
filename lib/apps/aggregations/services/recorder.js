var _ = require('lodash')
  , Promise = require('bluebird')
  , redis = require('@ftbl/redis')
  , Aggregation = require('../repositories/aggregation');

var Recorder = function(context) {
  if (this instanceof Recorder === false) return new Recorder(context);

  this.context = context;
};

var record = function(accountId, status, timestamp, data) {
  var aggregation = { 
    accountId: accountId
  , status: status
  , recordedAt: new Date
  , data: data 
  };

  if (timestamp) aggregation.timestamp = timestamp;
  if (data && data.error) aggregation.error = true;

  return Aggregation.create(aggregation);
};

Recorder.prototype.scheduled = function(accountId, runAt) {
  return record(accountId, 'scheduled', null, { runAt: runAt });
};

var mark = function(accountId, status) {
  return redis.connection.setex(redis.key('aggregate', 'running', accountId), 30, status);
};

Recorder.prototype.isRunning = function(accountId) {
  return redis.connection.get(redis.key('aggregate', 'running', accountId));
};

Recorder.prototype.running = function(accountId, timestamp) {
  return mark(accountId, true).then(function() {
    return record(accountId, 'running', timestamp);
  });
};

Recorder.prototype.complete = function(accountId, timestamp, data) {
  return mark(accountId, null).then(function() {
    return record(accountId, 'complete', timestamp, data);
  });
};

Recorder.prototype.cancelled = function(accountId, session) {
  return mark(accountId, null).then(function() {
    return record(accountId, 'cancelled', null, { session: session });
  });
};

Recorder.prototype.error = function(accountId, timestamp, error) {
  return this.complete(accountId, timestamp, { error: error });
};

Recorder.prototype.published = function(accountId, timestamp) {
  return redis.connection.incr(redis.key('aggregate', 'count', accountId, timestamp));
};

module.exports = Recorder;
