var _ = require('lodash')
  , inherits = require('util').inherits
  , Promise = require('bluebird')
  , Base = require('@ftbl/store').Repository
  , util = require('@ftbl/store').util
  , schema = require('../schemas/member');

var NAME = 'member';

var Repository = function() {
  if (this instanceof Repository === false) return new Repository;

  Base.call(this, NAME, schema);
};

inherits(Repository, Base);

Repository.prototype.sanitize = function(member) {
  if (member == null) return;
  
  return member;
};

Repository.prototype.clean = function(member) {
  if (member == null) return;

  return member;
};

module.exports = new Repository;
