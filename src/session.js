
//TODO
// get the sha1 hash from the password and assign this hash to the class
// variable "password"

var Session = BugSwarm.Session = function(username, password, cfg) {
  /**
  * Object used to return functions that will be
  * public
  * 
  * Module Pattern
  * @see http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth 
  * 
  * @api private
  */
  
  var my = {};
  
  //password = sha1(password);

  /** 
  * Merging internal configurations with the public ones
  */
  var internalcfg = { xmpp_service: 'http://bugswarm.net/bosh',
		      domain: 'xmpp.bugswarm.net',
                      swarmsrv: 'swarms.xmpp.bugswarm.net',
                      resource: 'web',
                      version: '1.0.0'
                    };
  var config = $.extend(true, {}, cfg, internalcfg);


  var conn = new BugSwarm.Connection(config);

  /**
  * Starts the session with the server
  *
  * @param {String} User name
  * @param {String} Super secret password
  * 
  * @api 
  */

  my.start = function(fn) {
    var resource = config.resource;
    var domain = config.domain;
    var version = config.version;
        
    if(!username || !password) {
      throw new Error("You must provide the user and password to log in to bugswarm.");
    }

    var jid = username + '@' + domain;
    if(resource) {
      jid += '/' + resource + '-jsapi-' + version;
    }

    conn.connect(jid, password, fn);
  };

  /**
  * Ends the session with the server
  * 
  * @api public
  */ 

  my.end = function(fn) {
    conn.disconnect(fn);
  };
  
  my.barejid = function() {
    return conn.barejid();
  };

  my.connection = function() {
    return conn;
  };

  my.config = function() {
    return config;
  };

  return my;
};

