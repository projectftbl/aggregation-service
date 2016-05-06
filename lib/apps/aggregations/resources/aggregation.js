var Aggregator = require('../services/aggregator')
  , broadcast = require('@ftbl/bus').broadcast;

module.exports = function(middleware, errors) {
  return {
    put: function *(next) {
      var aggregator = new Aggregator(this.context);
      
      yield aggregator.aggregate(this.params.id);
      
      this.status = 204;
    }

  , delete: function *(next) {
      broadcast('aggregate:cancel', this.params.id, this.context);

      this.status = 204;
    }
  };
};
