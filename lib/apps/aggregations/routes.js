module.exports = function(router, resource, middleware, errors) {
  var aggregations = resource.aggregations(middleware, errors)
    , aggregation = resource.aggregation(middleware, errors)
    , latest = resource.latest(middleware, errors)
    , reschedule = resource.reschedule(middleware, errors)
    , schedules = resource.schedules(middleware, errors);

  router.get('/', aggregations.get);
  router.post('/', aggregations.post);
  
  router.post('/reschedule', reschedule.post);

  router.put('/:id', aggregation.put);
  router.delete('/:id', aggregation.delete);

  router.get('/:id/latest', latest.get);
  
  router.post('/:id/schedules', schedules.post);
};
