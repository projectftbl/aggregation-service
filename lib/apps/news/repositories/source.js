var _ = require('lodash')
  , inherits = require('util').inherits
  , Promise = require('bluebird')
  , Base = require('@ftbl/store').Repository
  , util = require('@ftbl/store').util
  , schema = require('../schemas/source');

var NAME = 'source';

var Repository = function() {
  if (this instanceof Repository === false) return new Repository;

  Base.call(this, NAME, schema);
};

inherits(Repository, Base);

Repository.prototype.sanitize = function(source) {
  if (source == null) return;
  
  return source;
};

Repository.prototype.clean = function(source) {
  if (source == null) return;

  return source;
};

module.exports = new Repository;
