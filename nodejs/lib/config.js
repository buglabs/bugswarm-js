var config = {
    development: {
        baseurl: 'http://localhost:8002',
        apikey_header: 'x-bugswarmapikey',
        debug: true
    },
    
    integration: {
        baseurl: 'http://localhost:8002',
        apikey_header: 'x-bugswarmapikey',
        debug: true
    },
    
    test: {
        baseurl: 'http://localhost:8002',
        apikey_header: 'x-bugswarmapikey',
        debug: true
    },

    production: {
        baseurl: 'http://api.bugswarm.net',
        apikey_header: 'x-bugswarmapikey',
        debug: false
    }
};
var env = process.env.NODE_ENV || 'development';
module.exports = config[env];
