var sources = require('../mocks/data/sources');

module.exports = function(middleware, errors) {
  
  return { 
    get: function *(next) { 
      this.status = 200;
      this.body = { sources: sources }; 
    }
  };
};