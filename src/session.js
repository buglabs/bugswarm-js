
var Session = BugSwarm.Session = function(fn, cfg) {
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

  /** 
  * Merging internal configurations with the public ones
  */
  var internalcfg = { url: 'xmpp.bugswarm.net',
                      swarmsrv: 'swarms.xmpp.bugswarm.net',
                      resource: 'web',
                      version: '1.0.0'
                    };
  var config = $.extend(true, {}, cfg, internalcfg);


  var conn = new BugSwarm.Connection(fn, config);

  /**
  * Starts the session with the server
  *
  * @param {String} User name
  * @param {String} Super secret password
  * 
  * @api 
  */

  my.start = function(username, password) {
    var resource = config.resource;
    var url = config.url;
    var version = config.version;
        
    if(!username || !password) {
      throw new Error("You must provide the user and password to log in to bugswarm.");
    }

    var jid = username + '@' + url;
    if(resource) {
      jid += '/' + resource + '-jsapi-' + version;
    }

    conn.connect(jid, password);
  };

  /**
  * Ends the session with the server
  * 
  * @api public
  */ 

  my.end = function() {
    conn.disconnect();
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

