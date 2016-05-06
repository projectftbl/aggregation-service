var Scheduler = require('../services/scheduler');

module.exports = function(middleware, errors) {
  return {
    post: function *(next) {
      var scheduler = new Scheduler(this.context);
      
      yield scheduler.schedule(this.params.id);
      
      this.status = 204;
    }
  };
};