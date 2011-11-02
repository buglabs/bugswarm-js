var request = require('superagent');
var config = require('../config');

var Resource = module.exports = function(apikey, data) {
    if (!apikey) {
        throw new TypeError('You must provide an API Key as first ' +
        'argument to this constructor.');
    }
    
    var url = config.baseurl + '/resources';
    
    var my = {};
    my.create = function() {
        var callback;

        var arglen = arguments.length;
        if (arglen > 1 || arglen < 1) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide one argument.');
        }
        
        if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('A callback function is expected as ' +
                'first argument.');
            }
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
        
    };
    
    return my;
};

Resource.destroy = function(){};
Resource.get = function(id){};
Resource.prototype.swarms = function(){};
