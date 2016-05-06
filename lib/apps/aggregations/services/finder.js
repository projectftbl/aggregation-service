var _ = require('lodash')
  , Promise = require('bluebird')
  , redis = require('@ftbl/redis')
  , Aggregation = require('../repositories/aggregation');

var Finder = function(context) {
  if (this instanceof Finder === false) return new Finder(context);

  this.context = context;
};

Finder.prototype.latest = function(accountId, query) {
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

Finder.prototype.list = Promise.method(function(query) {
  if (query && query.status) return listByStatus(query.status, query);
  if (query && query.accountid) return Aggregation.listByAccount(query.accountid, query);

  return Aggregation.listLatest();
});

module.exports = Finder;
