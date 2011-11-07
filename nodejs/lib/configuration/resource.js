var request = require('superagent');
var config = require('../config');

var Resource = module.exports = (function() {
    var url = config.baseurl + '/resources';
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
            'the resource to be updated.');
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

        ['id', 'created_at', 'modified_at', 'user_id']
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

    my.swarms = function() {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var id = arguments[0];
        if (typeof id !== 'string' || !id.length) {
            throw new TypeError('A nonempty resource id string is expected as ' +
            'first argument in order to get the list of swarms where the ' +
            'the resource is participating.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        request
        .get(url + '/' + id + '/swarms')
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

    my.get = function(){
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
                'callback function is expected as the first ' +
                'argument.');
            }
        } else if (arglen == 2) {
            id = arguments[0];
            callback = arguments[1];
            if (typeof id !== 'string' ||
                !id.length ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two arguments, a ' +
                'string with a resource id as the first argument is expected '+
                'and a callback function as the second argument.');
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

    my.destroy = function(){
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var id = arguments[0];
        if (typeof id !== 'string' || !id.length) {
            throw new TypeError('A nonempty string is expected as ' +
            'first argument and it should be the resource id to be destroyed.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        request
        .del(url + '/' + id)
        .set(apikeyHeader, apikey)
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

    return my;
})();