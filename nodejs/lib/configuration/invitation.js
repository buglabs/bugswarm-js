var request = require('superagent');
var config = require('../config');

var SwarmService = require('./swarm');

var Invitation = function(key) {
    if (!key || !key.length) {
        throw new TypeError('You must provide an API Key to ' +
        'initialize this module.');
    }
    this.apikey = key;

    this.resourceUrl = config.baseurl + '/resources';
    this.invitationUrl = config.baseurl + '/invitations';
    this.swarmsUrl = config.baseurl + '/swarms';
};

(function() {
    var apikeyHeader = config.apikey_header;

    this.send = function() {
        var arglen = arguments.length;
        if (arglen !== 3) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide three arguments.');
        }

        var swarmId = arguments[0];
        if (typeof swarmId !== 'string' ||
            !swarmId.length) {
            throw new TypeError('A nonempty swarm id string is expected as ' +
            'first argument.');
        }

        var invitation = arguments[1];
        if (typeof invitation !== 'object') {
            throw new TypeError('An object is expected as the second ' +
            'argument.');
        }

        var callback = arguments[2];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'third argument.');
        }

        request
        .post(this.swarmsUrl + '/' + swarmId + '/invitations')
        .set(apikeyHeader, this.apikey)
        .data(invitation)
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

    this.get = function() {
        
    
    
    };

    this.accept = function() {};

    this.reject = function() {};
}).call(Invitation.prototype);

module.exports = Invitation;

