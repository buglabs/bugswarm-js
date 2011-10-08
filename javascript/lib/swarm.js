/**
 * @fileoverview This is the Javascript client for Swarm platform,
 * it provides the behavior to join and leave swarms as well as send and
 * receive messages from them.
 *
 * @author Bug Labs Inc.
 **/

(function(exports, io) {
    function connect() {
        var self = this;

        var socket = io.connect('http://@@API_SERVER@@:80');
        socket.on('connect', function() {
            var credentials = { apikey: self.options.apikey,
                                resource: self.options.resource,
                                swarms: self.options.swarms };

            socket.emit('swarm:connect', credentials);
        });

        socket.on('swarm:connected', function() {
            self.online = true;
            self.options.onconnect();
        });

        socket.on('swarm:message', self.options.onmessage);
        socket.on('swarm:presence', self.options.onpresence);
        socket.on('swarm:error', self.options.onerror);

        socket.on('swarm:system:error', function(error) {
            if (self.debug) {
                console.log(error);
            }
        });

        socket.on('disconnect', function() {
            self.online = false;
            if (self.debug) {
                console.log('disconnected');
            }
        });

        socket.on('error', function(error) {
            if (self.debug) {
                console.log(JSON.stringify(error));
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

    Swarm.prototype.connect = function(options) {

        //this.options = this.options || {};

        if (!options.apikey) {
            throw new Error('You must provide a Consumer API ' +
            'Key in order to join Swarms.');
        }

        if (!options.resource) {
            throw new Error('You must provide a Resource id ' +
            'in order to join Swarms.');
        }

        /*if (!options.swarms) {
            throw new Error('You need to specify which ' +
            'Swarm(s) you would like to join.');
        }

        if (!onmessage || typeof onmessage !== 'function') {
            throw new Error('In order to receive Swarm ' +
            'messages you need to provide a function callback.');
        }

        if (!onpresence || typeof onpresence !== 'function') {
            throw new Error('In order to receive presence ' +
            'from other resources you need to provide a function callback.');
        }

        if (!onerror || typeof onerror !== 'function') {
            throw new Error('Error handling is good for you, ' +
            'it saves you headaches, please provide a function callback.');
        }*/

        if (!options.onconnect || typeof options.onconnect !== 'function') {
            throw new Error('SWARM.connect is an asynchronous function, ' +
            'if you want to avoid race conditions please provide ' +
            'a function callback and use it to continue your execution flow.');
        }

        if (!Array.isArray(options.swarms)) {
            options.swarms = [options.swarms];
        }

        this.options = options;

        //onerror = onerror || function() {};
        //onpresence = onpresence || function() {};

        if (!this.online) {
            connect.call(this);
        }
    };

    Swarm.prototype.send = function(payload, swarms) {
        if (!this.online) {
            return;
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

    Swarm.prototype.join = function(swarms) {
        if (!this.online) {
            return;
        }

        if (!swarms) {
            throw new Error('You need to specify the ' +
            'swarm or swarms you would like to join.');
        }

        if (!Array.isArray(swarms)) {
            swarms = [swarms];
        }

        this.socket.emit('swarm:join', swarms);
    };

    exports.SWARM = new Swarm();
})(window, io);

