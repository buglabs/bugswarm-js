var request = require('superagent');
var config = require('../config');
//TODO - cache keys, basically apikey.participation should return the key
//right away or retrieve it from the server. The same applies for the
//configuration key.

var ApiKey = module.exports = function(username, password) {
    if (!username || !password) {
        throw new TypeError('You must provide a username and password as ' +
        'arguments to this constructor.');
    }

    /**
     * Authentication string.
     * @private
     **/
    var auth = 'Basic ' +
    new Buffer(username + ':' + password).toString('base64');

    var my = {};

    my.generate = function() {
        var type;
        var callback;

        var arglen = arguments.length;
        if (arglen > 2 || arglen < 1) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide at least one and ' +
            'maximum two arguments.');
        }

        if (arglen == 2) {
            type = arguments[0];
            callback = arguments[1];
            if (typeof type !== 'string' ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two arguments, a ' +
                'string with a API key type is expected as the first ' +
                'argument and a callback function as the second argument.');
            }
        }

        if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('When invoking with one argument, a ' +
                'callback function is expected.');
            }
        }

        var url = config.baseurl + '/keys';

        if (type) {
            url += '/' + type;
        }

        request
        .post(url)
        .set('Authorization', auth)
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

    my.get = function() {
        var type;
        var callback;

        var arglen = arguments.length;
        if (arglen > 2 || arglen < 1) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide at least one and ' +
            'maximum two arguments.');
        }

        if (arglen == 2) {
            type = arguments[0];
            callback = arguments[1];
            if (typeof type !== 'string' ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two arguments, a ' +
                'string with a API key type is expected as the first ' +
                'argument and a callback function as the second argument.');
            }
        }

        if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('When invoking with one argument, a ' +
                'callback function is expected.');
            }
        }

        var url = config.baseurl + '/keys';

        if (type) {
            url += '/' + type;
        }

        request
        .get(url)
        .set('Authorization', auth)
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

    return my;
};
