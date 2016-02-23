module.exports = function(router, resource, middleware, errors) {
  var members = resource.members(middleware, errors);
  
  router.get('/members', members.get);
};
