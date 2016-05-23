var _ = require('lodash')
  , Promise = require('bluebird')
  , redis = require('@ftbl/redis').connection
  , request = require('@ftbl/request')
  , publish = require('@ftbl/task').publish;

var Startup = function(context) {
  if (this instanceof Startup === false) return new Startup(context);

  this.context = context;
};

var getPage = function(key) {
  return redis
  .multi()
  .get(key)
  .incr(key)
  .expire(key, 60)
  .exec()
  .then(function(results) {
    if (results[0][1] == -1) return resetPage(key);
    return results[1][1];
  });
};

var resetPage = function(key) {
  return redis.setex(key, 60, -1).then(function() {
    return -1;
  });
};

Startup.prototype.start = function() {
  var that = this
    , key = 'aggregate:page';
  
  return getPage(key).then(function(page) {
    if (page === -1) return;

    return request('members/members/search', that.context).get({ page: page, limit: 100 })

    .then(function(data) {
      if (data.members.length === 0) return resetPage(key);

      data.members.forEach(function(member) {
        publish('aggregate:member', member.id, that.context);
      });

      return that.start();
    });
  });
};

Startup.prototype.member = function(memberId) {
  var context = this.context;

  return request('members/accounts', this.context).get({ memberid: memberId }).then(function(data) {
    if (data.accounts.length === 0) return;

    data.accounts.forEach(function(account) {console.log(account);
      publish('aggregate:schedule', account.id, context);
    });
  });
};

module.exports = Startup;
