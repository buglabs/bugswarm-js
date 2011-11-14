var EventEmitter = require('events').EventEmitter;
var Queue = require('./queue');
var config = require('../config');

var http = require('http');

var Connection = function() {
    EventEmitter.call(this);
};

//TODO Reconnections http://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html
//TODO use circular queue to not lose packets when disconnected.
util.inherits(Connection, EventEmitter);

(function() {
    var req;
    var queue = new Queue(100000);

    this.connect = function(options) {
        var self = this;
        var streamcfg = config.stream;

        var path = streamcfg.path;
        path += '?resource_id=' + options.resource;

        var swarms = options.swarms;

        for(var i in swarms) {
            path += '&swarm_id=' + swarms[i];
        }

        streamcfg.headers = {};
        streamcfg.headers[config.apikey_header] = options.apikey;

        req = http.request(streamcfg, function(res) {
            var buffer = '';
            res.on('data', function (chunk) {
                buffer += chunk;
                if (!chunk.match(/\r\n$/)) {
                    return;
                }
                self.emit('message', buffer);
                buffer = '';
            });
        });

        req.on('error', function(err) {
            //self.emit('error', err);
            //TODO find out the err.code associated to disconnections and
            //reconnect.
            console.log(err);
        });

        //initiates connection
        req.write('\n');
    };

    this.send = function(message) {
        try {
            message = JSON.stringify(message);
        } catch(e) {
            this.emit('error', e);
        }
        //queue.add(stanza);
        req.write(message);
    };

}).call(Connection.prototype);

module.exports = Connection;
