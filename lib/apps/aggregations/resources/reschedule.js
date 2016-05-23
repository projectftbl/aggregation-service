var Startup = require('../services/startup');

module.exports = function(middleware, errors) {
  return {
    post: function *(next) {
      yield new Startup(this.context).start();

      this.status = 204;
    }
  };
};
