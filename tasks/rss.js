var rss = require('../lib/apps/aggregations/providers/rss');

var URL = 'http://www.tribalfootball.com/rss/mediafed/general/rss.xml';
// var URL = 'http://www.independent.co.uk/sport/football/rss';

rss({ link: URL }).then(function(posts) {
  console.log(posts);
});