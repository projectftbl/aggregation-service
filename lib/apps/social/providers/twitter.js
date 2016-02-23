var twitter = require('@ftbl/social').twitter
  , publish = require('@ftbl/task').publish;

var mapToContent = function(tweet) {
  return {
    key: tweet.id
  , text: tweet.text
  // , date: 
  // , url:
  }
};

module.exports = function(member, options) {
  twitter.timeline(member.networkId, member).then(function(tweets) {
    tweets.forEach(function(tweet) {
      publish('content:publish', mapToContent(tweet), options);
    });
  });
};