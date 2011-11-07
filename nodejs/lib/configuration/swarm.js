var request = require('superagent');
var config = require('../config');

var Swarm = module.exports = (function() {
    var url = config.baseurl + '/swarms';
    var apikeyHeader = config.apikey_header;

    var apikey;
    var my = {};

    my.initialize = function(key) {
        if (!key || !key.length) {
            throw new TypeError('You must provide an API Key to ' +
            'initialize this module.');
        }
        apikey = key;
    };

    my.create = function() {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var data = arguments[0];
        if (typeof data !== 'object') {
            throw new TypeError('A object is expected as ' +
            'first argument.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        request
        .post(url)
        .set(apikeyHeader, apikey)
        .data(data)
        .end(function(err, res) {
            if (res.status == 201) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    my.update = function() {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var data = arguments[0];
        if (typeof data !== 'object' || !data.id || !data.id.length) {
            throw new TypeError('A object is expected as ' +
            'first argument and it has to include an id property of '+
            'the swarm to be updated.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        /**
         * Server complains if we send
         * additional parameters for updates.
         **/
        var id = data.id;

        ['id', 'created_at', 'modified_at', 'user_id',
         'create', 'update', 'resources']
        .forEach(function(p) {
            delete data[p];
        });

        request
        .put(url + '/' + id)
        .set(apikeyHeader, apikey)
        .data(data)
        .end(function(err, res) {
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    my.get = function() {
        var id, callback;

        var arglen = arguments.length;
        if (arglen > 2 || arglen < 1) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide at least one and ' +
            'maximum two arguments.');
        }

        if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('When invoking with one argument, a ' +
                'callback function is expected.');
            }
        } else if (arglen == 2) {
            id = arguments[0];
            callback = arguments[1];
            if (typeof id !== 'string' ||
                !id.length ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two arguments, a ' +
                'string with a swarm id is expected as first argument and '+
                'a callback function as the second argument.');
            }
        }

        request
        .get(id ? url + '/' + id : url)
        .set(apikeyHeader, apikey)
        .end(function(err, res) {
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    /**
     * options = {
     *      swarm_id: '',
     *      resource_id: '',
     *      type: 'consumer'
     * };
     **/

    my.addResource = function(options, callback) {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        if (typeof options !== 'object') {
            throw new TypeError('An object is expected as the first ' +
            'argument.');
        }

        if(typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        var swarmId = options.swarm_id;
        var resourceId = options.resource_id;
        var type = options.resource_type;

        if (typeof swarmId !== 'string' ||
            !swarmId.length) {
            throw new TypeError('Invalid type or property \'swarm_id\' ' +
            'missing in first argument.');
        }

        if (typeof type !== 'string' ||
            !type.length) {
            throw new TypeError('Invalid type or property \'resource_type\' ' +
            'missing in first argument.');
        }

        if (typeof resourceId !== 'string' ||
            !resourceId.length) {
            throw new TypeError('Invalid type or property \'resource_id\' ' +
            'missing in first argument.');
        }

        var resource = {
            resource_type: type,
            resource_id: resourceId
        };

        request
        .post(url + '/' + swarmId + '/resources')
        .set(apikeyHeader, apikey)
        .data(resource)
        .end(function(err, res) {
            if (res.status == 201) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    my.removeResource = function(options, callback) {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        if (typeof options !== 'object') {
            throw new TypeError('An object is expected as the first ' +
            'argument.');
        }

        if(typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        var swarmId = options.swarm_id;
        var resourceId = options.resource_id;
        var type = options.resource_type;

        if (typeof swarmId !== 'string' ||
            !swarmId.length) {
            throw new TypeError('Invalid type or property \'swarm_id\' ' +
            'missing in first argument.');
        }

        if (typeof type !== 'string' ||
            !type.length) {
            throw new TypeError('Invalid type or property \'resource_type\' ' +
            'missing in first argument.');
        }

        if (typeof resourceId !== 'string' ||
            !resourceId.length) {
            throw new TypeError('Invalid type or property \'resource_id\' ' +
            'missing in first argument.');
        }

        var resource = {
            resource_type: type,
            resource_id: resourceId
        };

        request
        .del(url + '/' + swarmId + '/resources')
        .set(apikeyHeader, apikey)
        .data(resource)
        .end(function(err, res) {
            if (res.status == 204) {
                callback();
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    my.resources = function() {
        var swarmId, resourceType, callback;

        var arglen = arguments.length;
        if (arglen > 3 || arglen < 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide at least two and ' +
            'maximum three arguments.');
        }

        if (arglen == 2) {
            swarmId = arguments[0];
            callback = arguments[1];
            if (typeof swarmId !== 'string' ||
                !swarmId.length ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two arguments, a ' +
                'swarm id string is expected as the first argument and a callback ' +
                'function as the second.');
            }
        } else if (arglen == 3) {
            swarmId = arguments[0];
            resourceType = arguments[1];
            callback = arguments[2];
            if (typeof swarmId !== 'string' ||
                !swarmId.length ||
                typeof resourceType !== 'string' ||
                !resourceType.length ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with three arguments, a ' +
                'string with a swarm id is expected as first argument, a '+
                'string with the resource type as the second and '+
                'a callback function as the third argument.');
            }
        }

        var data = {};
        if(resourceType) {
            data.type = resourceType;    
        }

        request
        .get(url + '/' + swarmId + '/resources')
        .data(data)
        .set(apikeyHeader, apikey)
        .end(function(err, res) {
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });

    };

    my.invite = function() {

    };

    my.destroy = function() {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var swarmId = arguments[0];
        if (typeof swarmId !== 'string' ||
            !swarmId.length) {
            throw new TypeError('A nonempty swarm id string is expected as ' +
            'first argument.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        request
        .del(url + '/' + swarmId)
        .set(apikeyHeader, apikey)
        .end(function(err, res) {
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    return my;
})();
