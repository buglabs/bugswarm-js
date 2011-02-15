/**
* Connection Class
*
*/

var Connection = BugSwarm.Connection = function(config) {
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
  * Bare Jabber Id
  * i.e. foo@xmpp.bugswarm.net
  * 
  * @type String
  * @api private
  */

  var barejid;


  /**
  * User provided callback which is called 
  * once the connection to the server ends.
  * 
  * It needs to be global because Strophe
  * receives just one function to handle 
  * the entire connection life cycle. This 
  * callback is set it up in my.disconnect 
  * function and gets executed inside the main
  * callback which is the last parameter
  * provided by the user to the my.connect() 
  * function.
  * 
  * @type Function
  * @api private
  */
  
  var disconnectCallback;


  /**
  * @type Strophe.Connection
  * @api private
  */

  var xmppsrv = new Strophe.Connection(config.url);

  /**
  * Connection life cycle states
  * 
  * @api public
  */ 
    
  //my.status = Strophe.Status;

  /** 
  * Strophe specific code to connect against 
  * the xmpp server.
  *
  * @param {String} User name
  * @param {String} Password
  * @param {Function} Main callback through which 
  * we send every event associated 
  * with the xmpp connection life cycle.
  * 
  * @api private
  */

  my.connect = function (username, password, fn) {
    var callback = fn || function(){};

    xmppsrv.connect(username, password, function(status, error) {
      var debug = config.debug;

      if(status == Strophe.Status.CONNECTED) {
         //sending presence
          xmppsrv.send($pres({xmlns:Strophe.NS.CLIENT}).tree());

          barejid = Strophe.getBareJidFromJid(username);
        
          debug && console.log('Connected as ' + username);

          callback(status);
      } else if( status == Strophe.Status.ERROR ||
                 status == Strophe.Status.AUTHFAIL) {
          callback(status, error);
      } else if( status == Strophe.Status.DISCONNECTED) {
        debug && console.log('Disconnected');

        disconnectCallback(status, error);
      }
           
      /*
      switch(status) {
        case Strophe.Status.CONNECTING:
          debug && console.log('Connecting to ' + config.url + '...');
          break;
        case Strophe.Status.DISCONNECTING:
          debug && console.log('Diconnecting...');
          break;
        case Strophe.Status.DISCONNECTED:
          debug && console.log('Disconnected');
          callback(status, error);
          break;
        case Strophe.Status.CONNECTED:
          //sending presence
          xmppsrv.send($pres({xmlns:Strophe.NS.CLIENT}).tree());

          barejid = Strophe.getBareJidFromJid(username);

          debug && console.log('Connected');
          callback(status, error);
          break;

        case Strophe.Status.AUTHENTICATING:
          break;

        case Strophe.Status.CONNFAIL:
        case Strophe.Status.AUTHFAIL:
        case Strophe.Status.ERROR:
          debug && console.log('Connection failed: ' + error.message);
          callback(status, error);
          break;

        case Strophe.Status.ATTACHED:
          break;
      } */
    });
  };

  /**
  * Simple wrapper to disconnect from 
  * the server
  *
  * @api private
  */
  
  my.disconnect = function(fn) {
    disconnectCallback = fn || function() {};
    
    xmppsrv.disconnect();
  };

  /**
  * Returns the bare jabber id
  * 
  * @api private
  */ 

  my.barejid = function() {
    return barejid;
  };

  /**
  * Simple wrapper for Strophe send function
  * @api private
  */

  my.send = function(elem) {
    xmppsrv.send(elem);
  }; 

  /**
  * Simple wrapper for Strophe sendIQ function
  * @api private
  */

  my.sendIQ = function(elem, callback, errback, timeout) {
    xmppsrv.sendIQ(elem, callback, errback, timeout);
  };

  /**
  * Simple wrapper for Strophe addHandler function
  * @api private
  */

  my.addHandler = function(handler, ns, name, type, id, from, options) {
    xmppsrv.addHandler(handler, ns, name, type, id, from, options);
  };

  return my;
};

/*
* Public constants
* @api public
*/
Connection.CONNECTED = Strophe.Status.CONNECTED;
Connection.DISCONNECTED = Strophe.Status.DISCONNECTED;
Connection.ERROR = Strophe.Status.ERROR;
Connection.AUTHFAIL = Strophe.Status.AUTHFAIL;
Connection.CONNFAIL = Strophe.Status.CONNFAIL;
