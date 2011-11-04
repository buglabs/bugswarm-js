var request = require('superagent');
var config = require('../config');
var Swarm = require('./swarm');

var Resource = module.exports = function(apikey, data) {
    if (!apikey || !apikey.length) {
        throw new TypeError('You must provide an API Key as first ' +
        'argument to this constructor.');
    }

    var url = config.baseurl + '/resources';

    var my = data;
    my.create = function() {
        var arglen = arguments.length;
        if (arglen > 1 || arglen < 1) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide one argument.');
        }

        var callback = arguments[0];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as ' +
            'first argument.');
        }

        request
        .post(url)
        .set('x-bugswarmapikey', apikey)
        .data(data)
        .end(function(err, res) {
            if (res.status == 201) {

                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body;
                }
                callback(err);
            }
        });
    };

    my.update = function() {
        var arglen = arguments.length;
        if (arglen > 2 || arglen < 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var id = arguments[0];
        if (typeof id !== 'string' || !id.length) {
            throw new TypeError('A nonempty string is expected as ' +
            'first argument and it should be the resource id to be ' +
            'updated.');
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
        ['id', 'created_at', 'modified_at', 'user_id']
        .forEach(function(p) {
            delete data[p];
        });

        request
        .put(url + '/' + id)
        .set('x-bugswarmapikey', apikey)
        .data(data)
        .end(function(err, res) {
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body;
                }
                callback(err);
            }
        });
    };

    my.swarms = function() {
        var arglen = arguments.length;
        if (arglen > 1 || arglen < 1) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide one argument.');
        }

        var callback = arguments[0];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'first argument.');
        }

        request
        .get(url + '/' + data.id + '/swarms')
        .set('x-bugswarmapikey', apikey)
        .end(function(err, res) {
            if (res.status == 200) {
                var swarms = [];
                for (var i = 0, len = res.body.length; i < len; i++) {
                    swarms.push(new Swarm(apikey, res.body[i]));
                }
                //TODO create Swarms instances and
                //return them inside an array.
                callback(err, swarms);
            } else {
                if (!err) {
                    err = res.body;
                }
                callback(err);
            }
        });
    };

    return my;
};

Resource.get = function(){
    var url = config.baseurl + '/resources';

    var apikey, id, callback;

    var arglen = arguments.length;
    if (arglen > 3 || arglen < 2) {
        throw new TypeError('Wrong number of arguments. In order to ' +
        'invoke this function you need to provide at least two and ' +
        'maximum three arguments.');
    }

    if (arglen == 2) {
        apikey = arguments[0];
        callback = arguments[1];
        if (typeof apikey !== 'string' ||
            !apikey.length ||
            typeof callback !== 'function') {
            throw new TypeError('When invoking with two arguments, a ' +
            'string with an API Key is expected as the first ' +
            'argument and a callback function as the second argument.');
        }
    } else if (arglen == 3) {
        apikey = arguments[0];
        id = arguments[1];
        callback = arguments[2];
        if (typeof apikey !== 'string' ||
            !apikey.length ||
            typeof id !== 'string' ||
            !id.length ||
            typeof callback !== 'function') {
            throw new TypeError('When invoking with three arguments, a ' +
            'string with an API Key is expected as the first ' +
            'argument, a string with a resource id as the second '+
            'and a callback function as the third argument.');
        }
    }

    if (id) {
        url += '/' + id;
    }

    request
    .get(url)
    .set('x-bugswarmapikey', apikey)
    .end(function(err, res) {
        if (res.status == 200) {
            if(id) {
                var resource = new Resource(apikey, res.body);
                callback(err, resource);
            } else {
                var resources = [];
                for (var i = 0, len = res.body.length; i < len; i++) {
                    resources.push(new Resource(apikey, res.body[i]));
                }
                callback(err, resources);
            }
        } else {
            if (!err) {
                err = res.body;
            }
            callback(err);
        }
    });
};

Resource.destroy = function(){
    var url = config.baseurl + '/resources';

    var arglen = arguments.length;
    if (arglen > 3 || arglen < 3) {
        throw new TypeError('Wrong number of arguments. In order to ' +
        'invoke this function you need to provide two arguments.');
    }

    var apikey = arguments[0];
    if (typeof apikey !== 'string' || !apikey.length) {
        throw new TypeError('A nonempty string is expected as ' +
        'first argument and it should be your API Key updated.');
    }

    var id = arguments[1];
    if (typeof id !== 'string' || !id.length) {
        throw new TypeError('A nonempty string is expected as ' +
        'second argument and it should be the resource id to be destroyed.');
    }

    var callback = arguments[2];
    if (typeof callback !== 'function') {
        throw new TypeError('A callback function is expected as the ' +
        'second argument.');
    }
    
    request
    .del(url + '/' + id)
    .set('x-bugswarmapikey', apikey)
    .end(function(err, res) {
        if (res.status == 204) {
            callback();
        } else {
            if (!err) {
                err = res.body;
            }
            callback(err);
        }
    });
};