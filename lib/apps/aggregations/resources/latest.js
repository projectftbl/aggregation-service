var Finder = require('../services/finder');

module.exports = function(middleware, errors) {
  return {
    get: function *(next) {
      var finder = new Finder(this.context);

      this.status = 200;
      this.body = { aggregation: yield finder.latest(this.params.id, this.query) };
    }
  };
};