var Notification = BugSwarm.Notification = function(bugswarm) {
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
  * Server connection
  * @type Strophe.Connection
  * @api private
  */
  var xmppsrv = session.connection();

  /**
  * Bare Jabber Id
  * 
  * @type String
  * @api private
  *
  * i.e. foo@xmpp.bugswarm.net
  */
  var barejid = session.barejid();

  /**
  * User provided configuration
  * expanded with the internal configuration
  * 
  * @type Object
  * @api private
  */


  var config = session.config();

  /**
  * Update callback. 
  * It is called when the node receives
  * notifications from the server
  *
  * @api private
  */

  var onevent = function(){};

  my.onEvent = function(fn) {
    onevent = fn || function(){};

    xmppsrv.addHandler(function(message) {
      var from = $(message).attr('from');
      var type = $(message).attr('type');
      var notice = $(message).attr('notice');
      var status = $(message).find('status').text() || '';
      var error = $(message).find('error').text() || '';
   
      if(type == 'error') {
        console.log(from + ' Error: ' + error);
      } else if(type == 'notification') {
        var data = {  from: from, 
                      type: type, 
                      notice: notice, 
                      status: status,
                      error: error 
                    };

        onevent(data);
      }

      return true; //needed to keep persistent this handler
    }, null, 'items');

  };

  return my;
}
