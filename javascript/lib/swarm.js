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
     * Makes sure that Array.isArray exists. (ES5)
     **/
    if (!Array.isArray) {
        Array.isArray = (function() {
            // save a reference built-in Object.prototype.toString
            var builtInToString = Object.prototype.toString;

            // save a reference to built-in Function.prototype.call
            var builtInToCall = Function.prototype.call;

            // requires a built-in bind function, not a shim
            var callWithArgs = builtInToCall.bind(builtInToCall);

            var argToString = function(o) {
                return callWithArgs(builtInToString, o);
            };

            return function(o) {
                return argToString(o) === '[object Array]';
            };
        })();
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
     * Sends messages to every joined swarm or a subset of them.
     * @param {Object} stanza A javascript object representing the stanza.
     * @param {Array} _swarms An array of a selected group
     * of previously joined swarms.
     * to which the user wants to send the message.
     * @private
     **/
    function send(stanza, _swarms) {
        var swarms = [];
        if (_swarms) {
            swarms = _swarms;
        } else {
            swarms = this.swarms;
        }

        var len = swarms.length;
        for (var i = 0; i < len; i++) {
            //TODO we should append the server
            //since we are going to have a cluster of federated servers.
            if (stanza.presence) {
                stanza.presence.to = swarms[i] + '@' +
                                    this.swarmsrv + '/' + this.nickname;
            } else if (stanza.message) {
                stanza.message.to = swarms[i] + '@' + this.swarmsrv;
            }
            this.socket.emit('message', stanza);
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

        var socket = io.connect('http://api.bugswarm-dev'); //FIXME
        socket.on('connect', function() {
            socket.emit('apikey', self.apikey);
        });

        socket.on('disconnect', function() {
            self.online = false;
            console.log('disconnected');
        });

        socket.on('connected to backend', function() {
            self.nickname = 'browser-' +
                            (Math.random() + '' + Date.now()).split('.')[1];
            //self.server = server;
            self.swarmsrv = 'swarms.xmpp.bugswarm-dev'; //FIXME
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
            var self = this;
            var swarms = options.swarms;
            if (!Array.isArray(swarms)) {
                this.swarms = [swarms];
            }

            send.call(this, {
                presence: {}
            });
        }

        if (!this.online) {
            connect.call(this, function() {
                _join.call(self);
            });
        } else {
            _join.call(this);
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
            var len = self.swarms.length;
            for (var i = 0; i < len; i++) {
                var len_ = swarms.length;
                for (var j = 0; j < len_; j++) {
                    if (self.swarms[i] == swarms[j]) {
                        self.swarms.splice(i, 1);
                    }
                }
            }
        } else {
            self.swarms = [];
        }
    };

    Swarm.prototype.send = function(payload) {
        if (typeof payload == 'object') {
            payload = JSON.stringify(payload);
        }
        var stanza = {
            message: {
                type: 'groupchat',
                body: payload
            }
        };
        send.call(this, stanza);
    };

    exports.SWARM = new Swarm();
})(window, io);

