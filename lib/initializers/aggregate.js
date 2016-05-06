var users = require('@ftbl/users')
  , Startup = require('../apps/aggregations/services/startup');

module.exports = function() {

  setTimeout(function() {
    new Startup({ user: users({ name: 'system' }) }).start();
  }, 1000);
};
