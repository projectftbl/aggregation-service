var cron = require('cron')
  , request = require('@ftbl/request')
  , publish = require('@ftbl/task').publish
  , scheduler = require('@ftbl/scheduler').scheduler;

var ON = '0 */15 * * * *';

module.exports = function() {

  setTimeout(function() {

    request('/news/sources').get().then(function(data) {

      if (data.sources.length === 0) return;

      var job = function(data, options) {
        publish('news:harvest', data, options);
      };

      data.sources.forEach(function(source) {
        new cron.CronJob(ON, function() {
          job(source) 
        }, null, true);

        // scheduler.schedule(job, source.on || ON, null, options, source);
      });
    });

  }, 1000);
};