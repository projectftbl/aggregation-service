var facebook = require('@ftbl/social').facebook;

module.exports = function(account, token) {

  var mapToContent = function(item) {
    return {
      key: item.id
    , text: item.text
    // , date: 
    // , url:
    }
  };

  return facebook.feed(account.networkId, token).then(function(feed) {
    return feed.map(mapToContent);
  });
};