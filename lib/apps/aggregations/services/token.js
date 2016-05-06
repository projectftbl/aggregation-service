var Promise = require('bluebird')
  , request = require('@ftbl/request');

module.exports = Promise.method(function(account, options, context) {
  if (account.token || options.token === false) return account;

  return request('members/accounts/tokens', context).get({ network: account.network }).then(function(data) {
    if (data.tokens && data.tokens.length) return data.tokens[0];
  });
});