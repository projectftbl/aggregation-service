var _ = require('lodash')
  , moment = require('moment')
  , log = require('@ftbl/log')
  , request = require('@ftbl/request')
  , publish = require('@ftbl/task').publish
  , Recorder = require('./recorder')
  , getAccount = require('./account')
  , getToken = require('./token');

var NETWORKS = {
  twitter: { token: true }
, rss: { token: false }
};

var TIMESTAMP = 'YYYYMMDDHHmmss';

var Aggregator = function(context) {
  if (this instanceof Aggregator === false) return new Aggregator(context);

  this.context = context;
};

Aggregator.prototype.aggregate = function(accountId) {
  var context = this.context
    , record = new Recorder(context);

  return getAccount(accountId, this.context).then(function(account) {
    if (account == null || NETWORKS.hasOwnProperty(account.network) === false || account.schedule == null) return;

    var timestamp = moment().format(TIMESTAMP);

    return record.running(accountId, timestamp).then(function() {
      return getToken(account, NETWORKS[account.network], context).then(function(token) {
        if (token == null) return;

        var provider = require('../providers/' + account.network)
          , data = { accountId: account.id, memberId: account.memberId, timestamp: timestamp };

        return provider(account, token)

        .then(function(contents) {
          contents.forEach(function(content) {
            publish('aggregate:content', _.assign({}, data, { content: content, recordedAt: new Date }), context);
          });

          return record.complete(accountId, timestamp);
        })

        .catch(function(error) {
          log.error(error);
          return record.error(accountId, timestamp, 'error');
        })

        .finally(function() {
          publish('aggregate:schedule', accountId, context);
        });
      });
    });
  });
};

module.exports = Aggregator;
