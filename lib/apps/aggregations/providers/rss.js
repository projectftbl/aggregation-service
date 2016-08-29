var _ = require('lodash')
  , log = require('@ftbl/log')
  , FeedParser = require('feedparser')
  , Promise = require('bluebird')
  , moment = require('moment')
  , request = require('request')
  , sanitize = require('sanitize-html');

var feed = function(url, done) {
  var req = request(url);
  req.setHeader('accept', 'application/xml,application/xhtml+xml,text/html');

  var posts = []
    , feedParser = new FeedParser();

  req
  .on('error', done)
  .on('response', function(res) {
    if (res.statusCode !== 200) {
      done(new Error)
    } else {
      res.pipe(feedParser);
    }
  });

  feedParser
  .on('error', done)
  .on('readable', function () {
    var stream = this
      , meta = this.meta
      , item;

    while (item = stream.read()) { 
      try {
        posts.push(item);
      } catch(err) {
        done(err);
      }
    }
  })
  .on('meta', function(meta) { /* no op */ })
  .on('end', function() {
    done(null, posts);
  });
};

var getImage = function(item) {
  if (item.image && _.isString(item.image)) return item.image;
  if (item.image && item.image.url) return item.image.url;
  if (item['rss:image'] && item['rss:image']['#']) return item['rss:image']['#'];
  if (item['rss:image'] && item['rss:image'].url) return item['rss:image'].url;
  if (item['media:content'] && item['media:content'].length) return item['media:content'][0]['@'].url;
  if (item['media:content']) return item['media:content'].url;
  if (item['media:thumbnail']) return item['media:thumbnail'].url;
};

module.exports = function(account) {
  var mapToContent = function(item) {
    var pubDate = item.pubdate || item.pubDate;

    return {
      createdAt: pubDate == null ? new Date() : new Date(pubDate)
    , title: item.title
    , author: item.author
    , url: item.link
    , summary: sanitize(item.summary)
    , text: sanitize(item.description)
    , categories: item.categories
    , key: item.link
    , data: {
        blog: item.meta.title
      }
    , network: 'rss'
    , source: account.link
    , image: getImage(item)
    };
  };

  return Promise.promisify(feed)(account.link).then(function(posts) {
    return posts.map(mapToContent);
  });
};