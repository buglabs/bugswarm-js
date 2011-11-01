var request = require('superagent');

var Resource = module.exports = function(data) {};
Resource.prototype.create = function(){return this;};
Resource.prototype.update = function(){return this;};
Resource.destroy = function(){};
Resource.list = function(){};
Resource.get = function(id){};
Resource.prototype.swarms = function(){};
