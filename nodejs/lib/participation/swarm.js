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
                    onerror: function(){},
                    onconnect: function(){} };

    this.connect = function(options) {
        for(var i in _options) {
            if(options[i]) {
                _options[i] = options[i];
            }
        }
    };

    this.join = function(swarms) {

    };

    this.leave = function(swarms) {

    };

    this.send = function() {

    };
}).call(Swarm.prototype);

module.exports = new Swarm(); //factory
