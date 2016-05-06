var Recorder = require('../services/recorder');

module.exports = function(middleware, errors) {
  return {
    get: function *(next) {
      var recorder = new Recorder(this.context);

      this.status = 200;
      this.body = { aggregation: yield recorder.latest(this.params.id, this.query) };
    }
  };
};