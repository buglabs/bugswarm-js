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
            self.trigger('connect', null);
        });

        socket.on('swarm:message', function(stanza) {
            stanza = JSON.parse(stanza);
            self.trigger('message', stanza.message);
        });

        socket.on('swarm:presence', function(stanza) {
            stanza = JSON.parse(stanza);
            self.trigger('presence', stanza.presence);
        });

        socket.on('swarm:error', function(stanza) {
            stanza = JSON.parse(stanza);
            self.trigger('error', stanza.errors);
        });

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
            self.trigger('disconnect', null);
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
        this._listeners = {};
        this._listeners['error'] = [];
        this._listeners['presence'] = [];
        this._listeners['message'] = [];
        this._listeners['connect'] = [];
        this._listeners['disconnect'] = [];
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


        if (options.onerror) {
            this._listeners.error.push(options.onerror);
        }
        if (options.onpresence) {
            this._listeners.presence.push(options.onpresence);
        }
        if (options.onmessage) {
            this._listeners.message.push(options.onmessage);
        }
        if (options.onconnect) {
            this._listeners.connect.push(options.onconnect);
        }
        if (options.ondisconnect) {
            this._listeners.disconnect.push(options.ondisconnect);
        }

        if (!this.online) {
            connect.call(this);
        }
    };

    Swarm.prototype.addListener = function(name, callback, context) {
        if (!context) context = this;
        if (!callback || typeof callback !== 'function') {
            throw new Error('callback needs to be a valid function');
        }
        if (!this._listeners[name]) {
            throw new Error('event ' + name + ' does not exist on this object');
        }
        var f = function(e) { callback.apply(context, [e]); };
        this._listeners[name].push(f);
    };

    Swarm.prototype.removeListener = function(name, callback) {
        if (!this._listeners[name]) {
            throw new Error('event ' + name + ' does not exist on this object');
        }
        var i = this._listeners[name].length;
        while (i--) {
            if (this._listeners[name][i] === callback) {
                this._listeners[name].splice(i, 1);
            }
        }
    };

    Swarm.prototype.trigger = function(name, event) {
        if (!this._listeners[name]) {
            throw new Error('event ' + name + ' does not exist on this object');
        }
        var i = this._listeners[name].length;
        while (i--) this._listeners[name][i](event);
    };

    Swarm.prototype.disconnect = function() {
        this.socket.disconnect();
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

    exports.Swarm = Swarm;
    exports.SWARM = new Swarm();
})(window, io);

