var _ = require('lodash')
  , Promise = require('bluebird')
  , redis = require('@ftbl/redis')
  , Aggregation = require('../repositories/aggregation');

var Recorder = function(context) {
  if (this instanceof Recorder === false) return new Recorder(context);

  this.context = context;
};

var record = function(accountId, status, timestamp, data) {
  console.log(status + ' ' + accountId);

  return Aggregation.create({ 
    accountId: accountId
  , status: status
  , recordedAt: new Date
  , timestamp: timestamp
  , data: data 
  });
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

Recorder.prototype.latest = function(accountId, query) {
  return Aggregation.findLatestByAccount(accountId, query && query.status).then(function(aggregations) {
    if (aggregations.length === 0) return { status: 'missing' };
     
    var aggregation = aggregations[0];

    if (query && query.status === 'complete') {
      return redis.connection.get(redis.key('aggregate', 'count', accountId, aggregation.timestamp)).then(function(count) {
        return _.assign({}, aggregation, { count: parseInt(count || 0, 10) });
      });
    }

    return aggregation;
  });
};

var populateCount = Promise.method(function(aggregations) {
  if (aggregations.length === 0) return aggregations;

  var keys = _.map(aggregations, function(aggregation) {
    return redis.key('aggregate', 'count', aggregation.accountId, aggregation.timestamp);
  });

  return redis.connection.mget(keys).then(function(counts) {
    return _.map(aggregations, function(aggregation, index) {
      return _.assign({}, aggregation, { count: parseInt(counts[index] || 0, 10) });
    });
  });
});

var filterByStatus = function(aggregations, status, options) {
  return Aggregation.listByStatus(status, options).then(function(data) {
    var accounts = _.map(data, 'accountId');

    return _.reject(aggregations, function(a) {
      var d = _.find(data, { accountId: a.accountId });
      return _.includes(accounts, a.accountId) && d && new Date(d.recordedAt) > new Date(a.recordedAt);
    });
  });
};

var listByStatus = function(status, options) {
  return Aggregation.listByStatus(status, options).then(function(aggregations) {
    
    if (status === 'scheduled') {
      return filterByStatus(aggregations, 'running', options).then(function(aggregations) {
        return filterByStatus(aggregations, 'complete', options);
      });
    }

    if (status === 'running') return filterByStatus(aggregations, 'complete', options);
    if (status === 'cancelled') return filterByStatus(aggregations, 'scheduled', options);
    if (status === 'complete') return filterByStatus(aggregations, 'running', options).then(populateCount);

    return aggregations;
  });
};

Recorder.prototype.list = Promise.method(function(query) {
  if (query && query.status) return listByStatus(query.status, query);
  if (query && query.accountid) return Aggregation.listByAccount(query.accountid, query);

  return [];
});

module.exports = Recorder;
