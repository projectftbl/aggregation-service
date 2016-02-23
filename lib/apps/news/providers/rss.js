var FeedParser = require('feedparser')
  , moment = require('moment')
  , request = require('request')
  , sanitize = require('sanitize-html')
  , publish = require('@ftbl/task').publish;

var mapToContent = function(item) {
  return {
    date: item.pubdate
  , title: meta.title
  , title: item.title
  , author: item.author
  , url: item.link
  , summary: sanitize(item.summary)
  , description: sanitize(item.description)
  , categories: item.categories
  , key: item.link
  };
};

var feed = function(url, done) {
  var req = request(url);
  req.setHeader('accept', 'application/xml,application/xhtml+xml,text/html');

  var posts = []
    , feedparser = new FeedParser();

  req
  .on('error', done)
  .on('response', function(res) {
    if (res.statusCode !== 200) {
      done(new Error)
    } else {
      res.pipe(feedparser);
    }
  });

  feedparser
  .on('error', done)
  .on('readable', function () {
    var stream = this
      , meta = this.meta
      , item;

    while (item = stream.read()) { 
      try {
        posts.push(mapToContent(item));
      } catch(err) {
        done(err);
      }
    }
  })
  .on('meta', function(meta) {})
  .on('end', function() {
    done(null, posts);
  });
};


module.exports = function(source, options) {
  feed(source.url, function(err, posts) {
    if (err || posts == null) return;

    posts.forEach(function(post) {
      publish('content:publish', post, options);
    });
  });
};