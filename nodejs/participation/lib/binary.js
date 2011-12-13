var config = require('../config');

var Binary = function(key) {
    if (!key || !key.length) {
        throw new TypeError('You must provide an API Key to ' +
        'initialize this module.');
    }
    this.apikey = key;

    this.uploadUrl = config.baseurl + '/upload';
    this.filesUrl = config.baseurl + '/files';
};

(function() {
    this.upload = function(file) {
        //figure out what's the status in superagent for this.

    };

    this.get = function(file) {
        //this is a simple GET request
    };
}).call(Binary.prototype);

module.exports = Binary;
