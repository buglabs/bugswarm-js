var request = require('superagent');

var Invitation = module.exports = function(data) {};
Invitation.prototype.send = function() { return this;};
Invitation.prototype.accept = function() { return this;};
Invitation.prototype.reject = function() { return this;};
Invitation.get = function(filter) {};
