var Connection = require('./connection');

var Swarm = function() {
    this.conn = new Connection();
};
(function() {
    var _options = {apikey: '',
                    resource: '',
                    swarms: '',
                    onmessage: function(){},
                    onpresence: function(){},
                    onerror: function(){}};

    this.connect = function(options) {
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
            throw new Error('onconnect needs to a function.');
        }

        for(var i in _options) {
            if(options[i]) {
                _options[i] = options[i];
            }
        }

        this.conn.on('message', function(stanza) {
            if(stanza.message) {
                _options.onmessage(stanza.message);
            } else if(stanza.presence) {
                _options.onpresence(stanza.presence);
            } else if(stanza.error) {
                _options.onerror(stanza.error);
            }
        });

        this.conn.connect(_options);
    };

    function presence(swarms, type) {
        if(!swarms || !swarms.length) {
            throw new TypeError('Wrong parameters, you must provide at least ' +
            'one swarm.');
        }

        if(!Array.isArray(swarms)) {
            swarms = [swarms];
        }

        var stanza = {presence: {to: swarms}};

        if(type && type === 'unavailable') {
            stanza.presence.type = type;
        }

        this.conn.send(presence);
    }

    this.join = function(swarms) {
        presence.call(this, swarms);
    };

    this.leave = function(swarms) {
        presence.call(this, swarms, 'unavailable');
    };


    /**
     *
     * {swarms: '',
     *  resource: '',
     *  message: ''};
     *
     * or
     *
     * {swarm: '',
     *  message: ''}
     *
     * or
     *
     * message
     **/
    this.send = function(options) {
        var swarms;
        var message;
        var resource;

        if(typeof options === 'object') {
            swarms = options.swarms;
            message = options.message;
            resource = options.resource;
        } else {
            message = options;
        }

        var to = [];
        var stanza = {message: {}};

        if (swarms) {
            if (resource && resource.length) {
                return new TypeError('Resource should not be empty if ' +
                'specified.');
            }

            if(!Array.isArray(swarms)) {
                swarms = [swarms];
            }

            for(var i = 0, len = swarms.length; i < len; i++) {
                if(resource) {
                    to.push({resource: resource, swarm: swarms[i]});
                } else {
                    to.push(swarms[i]);
                }
            }

            stanza.message.to = to;
        }

        stanza.message.payload = message;

        this.conn.send(stanza);
    };
}).call(Swarm.prototype);

module.exports = new Swarm(); //factory
