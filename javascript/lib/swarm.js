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
            self.options.ondisconnect();
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
            throw new Error('You must provide a Participation API ' +
            'Key in order to join Swarms. Please go to ' +
            'http://developer.bugswarm.net/restful_api_keys.html#create ' +
            'to know how to create your API Keys.');
        }

        if (!options.resource) {
            throw new Error('You must provide a resource id ' +
            'in order to join Swarms. Please go to ' +
            'http://developer.bugswarm.net/restful_user_resources.html#create' +
            ' to know how to create your resources and ' +
            'http://developer.bugswarm.net/restful_swarm_resources.html#add ' +
            'for instructions about how to add your resource ' +
            'to your existing Swarm.');
        }

        if (!options.swarms ||
            (Array.isArray(options.swarms) && !options.swarms.length)) {
            throw new Error('You need to specify which ' +
            'Swarm(s) you would like to join. Please go to ' +
            'http://developer.bugswarm.net/restful_swarms.html#create ' +
            'if you want to know how to create them.');
        }

        if (options.onmessage &&
            typeof options.onmessage !== 'function') {
            throw new Error('onmessage needs to be a function.');
        }

        if (options.onpresence &&
            typeof options.onpresence !== 'function') {
            throw new Error('onpresence needs to be a function.');
        }

        if (options.onerror &&
            typeof options.onerror !== 'function') {
            throw new Error('onerror needs to be a function.');
        }

        if (options.onconnect &&
            typeof options.onconnect !== 'function') {
            throw new Error('onconnect needs to be a function.');
        }

        if (options.ondisconnect &&
            typeof options.ondisconnect !== 'function') {
            throw new Error('ondisconnect needs to be a function.');
        }

        if (!Array.isArray(options.swarms)) {
            options.swarms = [options.swarms];
        }

        this.options = options;

        options.onerror = options.onerror || function() {};
        options.onpresence = options.onpresence || function() {};
        options.onmessage = options.onmessage || function() {};
        options.onconnect = options.onconnect || function() {};
        options.ondisconnect = options.ondisconnect || function() {};

        if (!this.online) {
            connect.call(this);
        }
    };

    Swarm.prototype.disconnect = function() {
        socket.disconnect();
    };

    Swarm.prototype.send = function(payload, swarms) {
        if (!this.online) {
            return;
        }

        var message = {};
        if (swarms) {
            if (!Array.isArray(swarms)) {
                swarms = [swarms];
            }

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

