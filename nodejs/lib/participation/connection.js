var http = require('http');
var EventEmitter = require('events').EventEmitter;
var queue = require('./queue');
var config = require('../config');

var Connection = module.exports = function() {
    EventEmitter.call(this);
};

util.inherits(Connection, EventEmitter);

(function() {
    var req;

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

        /**
         * Docs
         **/
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
            self.emit('error', err);
            //TODO find out the err.code associated to disconnections and
            //reconnect.
        });

        //initiates connection
        req.write('\n');
    };

    this.send = function(payload) {
        //queue.push(payload);
        var stanza = { message: { payload: payload } };
        try {
            stanza = JSON.stringify(stanza);
        } catch(e) {
            this.emit('error', e);
        }
        req.write(stanza);
    };

}).call(Connection.prototype);
// verify if the nodejs http module support reconnections following http://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html
