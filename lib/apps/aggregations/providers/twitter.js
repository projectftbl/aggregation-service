var twitter = require('@ftbl/social').twitter;

module.exports =  function(account, token) {

  var findImage = function(media) {
    if (media == null || media.length === 0) return;
    
    return media[0].media_url_https;
  };

  var mapToContent = function(tweet) {
    return {
      key: tweet.id
    , text: tweet.text
    , source: 'twitter'
    , createdAt: new Date(tweet.created_at)
    , url: 'https://www.twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str
    , image: findImage(tweet.entities.media)
    , key: tweet.id_str
    , data: {
        retweets: tweet.retweet_count
      , likes: tweet.favorite_count
      }
    }
  };

  return twitter.timeline(account.networkId, token).then(function(tweets) {
    return tweets.map(mapToContent);
  });
};
