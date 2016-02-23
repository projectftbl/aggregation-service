var cron = require('cron')
  , request = require('@ftbl/request')
  , publish = require('@ftbl/task').publish
  , scheduler = require('@ftbl/scheduler').scheduler;

var ON = '* * * * * *';

module.exports = function() {

  setTimeout(function() {

    request('/social/members').get().then(function(data) {

      if (data.members.length === 0) return;

      var job = function(data, options) {
        publish('members:harvest', data, options);
      };

      data.members.forEach(function(member) {
        new cron.CronJob(ON, function() {
          job(member) 
        }, null, true);

        // scheduler.schedule(job, member.on || ON, null, member, options);
      });
    });

  }, 1000);
};