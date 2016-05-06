var youtube = require('@ftbl/social').youtube;

module.exports = function(account, token) {

  var mapToContent = function(upload) {
    return {
      key: upload.id
    // , date: 
    // , url:
    }
  };

  return google.uploads(account.networkId, token).then(function(uploads) {
    return uploads.map(mapToContent);
  });
};