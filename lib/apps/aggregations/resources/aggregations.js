var Recorder = require('../services/recorder')
  , broadcast = require('@ftbl/bus').broadcast;

module.exports = function(middleware, errors) {
  return {
    get: function *(next) {
      var recorder = new Recorder(this.context);

      this.status = 200;
      this.body = { aggregations: yield recorder.list(this.query) };
    }

  , post: function *(next) {
      broadcast('aggregate:log', null, this.context);

      this.status = 204;
    }
  };
};
