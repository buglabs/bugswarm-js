/**
 * @fileoverview This is the Javascript client for Swarm platform,
 * it provides the behavior to join and leave swarms as well as send and
 * receive messages from them.
 *
 * @author Bug Labs Inc.
 **/
(function(exports, io) {
    if (!io || !io.connect) {
        throw new Error('No socket.io detected');
    }

    /**
     * Creates Swarm instances.
     * @param {String} apikey The Api Key with permissions to join Swarms.
     * @constructor
     **/
    var Swarm = function() {
        this.online = false;
    };

    /**
     * Clones an object.
     * @param {Object} obj The object to be copied.
     * @return {Object} The copy of the object.
     **/

    function clone(obj) {
        if (obj == null ||
            typeof(obj) != 'object') {
            return obj;
        }

        var copy = new obj.constructor();

        for (var key in obj) {
            copy[key] = clone(obj[key]);
        }
        return copy;
    }


    /**
     * Sends messages to every joined swarm or a subset of them.
     * @param {Object} stanza A javascript object representing the stanza.
     * @param {Array} _swarms An array of a selected group
     * of previously joined swarms.
     * to which the user wants to send the message.
     * @private
     **/
    function send(stanza, _swarms) {
        var self = this;

        var swarms = [];
        if (_swarms) {
            swarms = _swarms;
        } else {
            swarms = this.swarms;
        }

        var len = swarms.length;
        for (var i = 0; i < len; i++) {
            var _stanza = clone(stanza);
            if (_stanza.presence) {
                _stanza.presence.to = swarms[i] + '@' +
                self.swarmsrv + '/' + self.nickname;
            } else if (_stanza.message) {
                _stanza.message.to = swarms[i] + '@' + self.swarmsrv;
            }
            console.log('Sending ' + JSON.stringify(_stanza));
            self.socket.emit('message', _stanza);
        }
    }

    /**
     * Connects to Swarm server.
     * @param {Function} callback The function to be
     * called to send connection statuses.
     * @private
     **/
    function connect(callback) {
        var self = this;

        var socket = io.connect('http://@@API_SERVER@@:80');
        socket.on('connect', function() {
            socket.emit('apikey', self.apikey);
        });

        socket.on('disconnect', function() {
            self.online = false;
            console.log('disconnected');
        });

        socket.on('connected to backend', function(server) {
            self.nickname = 'browser-' +
            (Math.random() + '' + Date.now()).split('.')[1];
            //self.server = server;
            self.server = server || '@@XMPP_SERVER@@';
            self.swarmsrv = 'swarms.' + self.server;
            self.online = true;

            callback.call(self);
        });

        socket.on('error', function(error) {
            console.log(JSON.stringify(error));
        });

        self.socket = socket;
    }

    Swarm.prototype.join = function(options) {
        var self = this;
        if (!options.apikey) {
            throw new Error('You must provide an API ' +
            'Key in order to join Swarms.');
        }

        if (!options.swarms) {
            throw new Error('You need to specify which ' +
            'Swarm(s) you would like to join.');
        }

        /*if (!options.messagecb || typeof options.messagecb != 'function') {
            throw new Error('In order to receive Swarm ' +
            'messages you need to provide a function callback');
        }*/

        if (!options.callback || typeof options.callback != 'function') {
            throw new Error('In order to receive Swarm messages ' +
            'you need to provide a function callback');
        }

        this.apikey = options.apikey;

        function _join() {
            self.swarms = options.swarms;

            if (!Array.isArray(self.swarms)) {
                self.swarms = [self.swarms];
            }

            send.call(self, {
                presence: {}
            });
        }

        if (!this.online) {
            connect.call(this, function() {
                _join();
            });
        } else {
            _join();
        }

        this.socket.on('message', options.callback);
    };

    Swarm.prototype.leave = function(swarms) {
        if (!this.online) {
            return;
        }

        if (swarms && ! Array.isArray(swarms)) {
            swarms = [swarms];
        }

        send.call(this, {
            presence: {
                type: 'unavailable'
            }
        },
        swarms);

        if (swarms) {
            var len = this.swarms.length;
            for (var i = 0; i < len; i++) {
                var len_ = swarms.length;
                for (var j = 0; j < len_; j++) {
                    if (this.swarms[i] == swarms[j]) {
                        this.swarms.splice(i, 1);
                    }
                }
            }
        } else {
            this.swarms = [];
        }
    };

    Swarm.prototype.send = function(payload) {
        if (typeof payload == 'object') {
            payload = JSON.stringify(payload);
        }
        var stanza = {
            message: {
                to: '', //workaround for json2xml converter
                type: 'groupchat',
                body: { $t: payload }
            }
        };
        send.call(this, stanza);
    };

    exports.SWARM = new Swarm();
})(window, io);

