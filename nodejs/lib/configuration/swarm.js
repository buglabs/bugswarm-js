var request = require('superagent');

var Swarm = module.exports = function(data) {};
Swarm.prototype.create = function() {return this;};
Swarm.prototype.update = function() {return this;};
Swarm.destroy = function() {};
Swarm.list = function() {};
Swarm.get = function() {};
Swarm.prototype.addResource = function() {return this;};
Swarm.prototype.removeResource = function() {return this;};
Swarm.resources = function() {};
Swarm.prototype.invite = function() {};