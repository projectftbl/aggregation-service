var Finder = require('../services/finder')
  , broadcast = require('@ftbl/bus').broadcast;

module.exports = function(middleware, errors) {
  return {
    get: function *(next) {
      var finder = new Finder(this.context);

      this.status = 200;
      this.body = { aggregations: yield finder.list(this.query) };
    }

  , post: function *(next) {
      broadcast('aggregate:log', null, this.context);

      this.status = 204;
    }
  };
};
