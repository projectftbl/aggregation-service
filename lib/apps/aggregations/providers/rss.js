var _ = require('lodash')
  , log = require('@ftbl/log')
  , FeedParser = require('feedparser')
  , Promise = require('bluebird')
  , moment = require('moment')
  , request = require('request')
  , sanitize = require('sanitize-html')
  , validator = require('html-validator')
  , cheerio = require('cheerio');

var HTML = '<!DOCTYPE html><head><title>dummy</title></head>';

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

  var image = _(item.enclosures).find(function(enclosure) {
    return enclosure.type.indexOf('image/') === 0;
  });

  if (image && image.url) return image.url;

  var item = item.item
    , $ = cheerio.load(item.description || item.summary || '<div/>')
    , img = $('img');

  if (img.get(0)) return img.get(0).attribs.src;
};

var validate =  function(title, html) {
  return new Promise(function(resolve) {
    validator({ data: HTML + html, validator: 'http://html5.validator.nu' }, function(err, data) {
      data = JSON.parse(data);
      if (err) return resolve('');
      if (data.messages.length) {
        log.error(title, data.messages);
        return resolve('');
      }
      return resolve(html);
    });
  });
};

var validateItem = function(item) {
  return validate(item.meta.title, sanitize(item.description)).then(function(description) {
    return validate(item.meta.title, sanitize(item.summary)).then(function(summary) {
      return _.assign({}, item, { summary: summary, description: description, item: item });
    });
  });
};

module.exports = function(account) {
  var mapToContent = function(item) {
    var pubDate = item.pubdate || item.pubDate
      , createdAt = pubDate == null ? new Date() : new Date(pubDate);

    if (isNaN(createdAt.getTime())) createdAt = new Date();

    return {
      createdAt: createdAt
    , title: item.title
    , author: item.author
    , url: item.link
    , image: getImage(item)
    , summary: item.summary
    , text: item.description
    , categories: item.categories
    , key: item.link
    , data: {
        blog: item.meta.title
      }
    , network: 'rss'
    , source: account.link
    };
  };

  return Promise.promisify(feed)(account.link).then(function(posts) {
    return Promise.map(posts, validateItem).then(function(posts) {
      return posts.map(mapToContent);
    });
  });
};