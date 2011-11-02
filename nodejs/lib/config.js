var config = {
    development: {
        baseurl: 'http://localhost:8002'
    }
};
var env = process.env.NODE_ENV || 'development';
module.exports = config[env];
