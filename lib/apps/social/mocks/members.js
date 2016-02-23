var members = require('./data/members');

module.exports = function(middleware, errors) {
  
  return { 
    get: function *(next) { 
      this.status = 200; 
      this.body = { members: members };
    }
  };
};