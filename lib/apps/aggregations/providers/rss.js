var FeedParser = require('feedparser')
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

module.exports = function(account) {

  var mapToContent = function(item) {
    return {
      createdAt: item.pubdate
    // , title: meta.title
    , title: item.title
    , author: item.author
    , url: item.link
    , summary: sanitize(item.summary)
    , text: sanitize(item.description)
    , categories: item.categories
    , key: item.link
    };
  };

  return feed(account.url, function(err, posts) {
    return posts.map(mapToContent);
  });
};