var request = require('@ftbl/request');

module.exports = function(accountId, context) {
  return request('members/accounts/' + accountId, context).get().then(function(data) {
    return data.account;
  });
};