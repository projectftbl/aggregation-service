var inherits = require('util').inherits
  , Base = require('@ftbl/store').Repository
  , schema = require('../schemas/aggregation');

var NAME = 'aggregation';

var Repository = function() {
  if (this instanceof Repository === false) return new Repository;

  Base.call(this, NAME, schema);
};

inherits(Repository, Base);

Repository.prototype.listLatest = function() {
  return this.find({}, { sort: 'recordedAt', dir: 'desc' });
};

Repository.prototype.listByAccount = function(accountId, options) {
  return this.find({ accountId: accountId }, options);
};

Repository.prototype.listByStatus = function(status, options) {
  var query = (status === 'error') ? { error: true } : { status: status };

  return this.table
  .orderBy(this.database.asc('accountId'))
  // .skip(?)
  // .limit(?)
  .filter(query)
  .group('status', 'accountId')
  .orderBy(this.database.desc('recordedAt'))
  .limit(1)
  .ungroup()
  .concatMap(function(group) { return group('reduction') });
};

Repository.prototype.findLatestByAccount = function(accountId, status) {
  var query = { accountId: accountId };

  if (status) query.status = status;

  return this.find(query, { limit: 1, sort: 'recordedAt', dir: 'desc' });
};

Repository.prototype.sanitize = function(aggr) {
  if (aggr == null) return;

  if (aggr.recordedAt) aggr.recordedAt = new Date(aggr.recordedAt).toISOString();
  if (aggr.data && aggr.data.runAt) aggr.data.runAt = new Date(aggr.data.runAt).toISOString();
  
  return aggr;
};

Repository.prototype.clean = function(aggr) {
  if (aggr == null) return;

  if (aggr.recordedAt) aggr.recordedAt = new Date(aggr.recordedAt);
  if (aggr.data && aggr.data.runAt) aggr.data.runAt = new Date(aggr.data.runAt);

  return aggr;
};

Repository.prototype.index = function(content) {
  return this.createIndex('recordedAt', 'accountId');
};

module.exports = new Repository;
