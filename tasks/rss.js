var rss = require('../lib/apps/aggregations/providers/rss');

var URL = 'http://www.fifa.com/rss/index.xml';

rss({ link: URL }).then(function(posts) {
  console.log(posts);
});