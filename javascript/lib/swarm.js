/**
 * @fileoverview This is the Javascript client for Swarm platform,
 * it provides the behavior to join and leave swarms as well as send and
 * receive messages from them.
 *
 * @author Bug Labs Inc.
 **/

(function(exports, io) {
    //there is not need for a buffer
    //socket.io handles it for us.
    function connect() {
        var self = this;

        var socket = io.connect('http://@@API_SERVER@@:80');
        socket.on('connect', function() {
            socket.emit('swarm:join', self.options);
        });

        socket.on('disconnect', function() {
            self.online = false;
            if (self.debug) {
                console.log('disconnected');
            }
        });

        socket.on('swarm:connected', function() {
            self.online = true;
        });

        socket.on('swarm:message', self.onmessage);
        socket.on('swarm.presence', self.onpresence);
        socket.on('swarm:error', self.onerror);

        socket.on('error', function(error) {
            if (self.debug) {
                console.log(JSON.stringify(error));
            }
        });

        socket.on('swarm:system:error', function(error) {
            if (self.debug) {
                console.log(error);
            }
        });

        self.socket = socket;
    }

    /**
     * @constructor
     **/
    var Swarm = function() {
        this.online = false;
    };

    Swarm.prototype.debug = false;

    Swarm.prototype.join = function(options,
                                    onmessage,
                                    onpresence,
                                    onerror) {
        if (!options.apikey) {
            throw new Error('You must provide a Consumer API ' +
            'Key in order to join Swarms.');
        }

        if (!options.resource) {
            throw new Error('You must provide a Resource id ' +
            'in order to join Swarms.');
        }

        if (!options.swarms) {
            throw new Error('You need to specify which ' +
            'Swarm(s) you would like to join.');
        }

        if (!onmessage || typeof onmessage !== 'function') {
            throw new Error('In order to receive Swarm ' +
            'messages you need to provide a function callback.');
        }

        if (!Array.isArray(options.swarms)) {
            options.swarms = [options.swarms];
        }

        this.options = options;

        onerror = onerror || function() {};
        onpresence = onpresence || function() {};

        this.onerror = onerror;
        this.onpresence = onpresence;
        this.onmessage = onmessage;

        if (!this.online) {
            connect.call(this);
        }
    };

    Swarm.prototype.send = function(payload, swarms) {
        if (!this.online) {
            return;
        }

        if (typeof payload === 'object') {
            payload = JSON.stringify(payload);
        }

        var message = {};
        if (swarms && !Array.isArray(swarms)) {
            swarms = [swarms];
            message.swarms = swarms;
        }

        message.payload = payload;

        this.socket.emit('swarm:send', message);
    };

    Swarm.prototype.leave = function(swarms) {
        if (!this.online) {
            return;
        }

        if (swarms && !Array.isArray(swarms)) {
            swarms = [swarms];
        }

        this.socket.emit('swarm:leave', swarms);
    };

    exports.SWARM = new Swarm();
})(window, io);

