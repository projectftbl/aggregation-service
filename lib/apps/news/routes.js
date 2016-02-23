module.exports = function(router, resource, middleware, errors) {
  var sources = resource.sources(middleware, errors);
  
  router.get('/sources', sources.get);
};
