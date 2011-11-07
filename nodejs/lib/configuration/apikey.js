var request = require('superagent');
var config = require('../config');

var ApiKey = module.exports = (function() {
    var url = config.baseurl + '/keys';
    var auth;

    var my = {};
    my.initialize = function(username, password) {
        if (!username || !username.length ||
            !password || !password.length) {
            throw new TypeError('You must provide a username and password ' +
            'to initialize this module.');
        }
        auth = 'Basic ' +
        new Buffer(username + ':' + password).toString('base64');
    };

    my.generate = function() {
        var type, callback;

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
        } else if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('When invoking with one argument, a ' +
                'callback function is expected.');
            }
        }

        request
        .post(type ? url + '/' + type : url)
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
        var type, callback;

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
        } else if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('When invoking with one argument, a ' +
                'callback function is expected.');
            }
        }

        request
        .get(type ? url + '/' + type : url)
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
})();
