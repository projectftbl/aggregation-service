var rss = require('../lib/apps/aggregations/providers/rss');

var URL = 'http://www.skysports.com/rss/11095';

rss({ link: URL }).then(function(posts) {
  console.log(posts);
});