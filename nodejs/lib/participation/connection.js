var http = require('http');
var util = require("util");

var EventEmitter = require('events').EventEmitter;

var queue = require('./circular-queue');

var Connection = module.exports = function() {
    EventEmitter.call(this);
};

util.inherits(Connection, EventEmitter);

Connection.prototype.connect = function() {};
Connection.prototype.send = function(body){
    this.emit('send', body);
};


// verify if the nodejs http module support reconnections following http://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html
