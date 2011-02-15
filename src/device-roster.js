
var DeviceRoster = BugSwarm.DeviceRoster = function(session) {
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
  * Presence callback. 
  * It is called when the roster receives
  * device presence notifications from the server
  *
  * @api private
  */

  var onpresence = function(){};

  /**
  * Roster change callback
  * This callback is called when
  * the server notifies a change to the roster 
  * associated with adding or removing devices.
  *
  * @api private
  */

  var onchange = function(){};

  /**
  * Devices callback
  * It gets call when the server send 
  * the list of devices that are part
  * of the user's roster weather 
  * they are online or not.
  *  
  * @api private
  */

  var ondevices = function(){};

  /**
  * Set up the callback to receive the
  * the devices from the server
  *
  * The callback must be prepare 
  * to receive an Array of Objects
  * that have the following
  * structure: 
  *
  * {  id: jid, 
  *    name: name,
  *    resource: resource,
  *    ask: ask,
  *    subscription: subscription
  * }
  * @param {Function} callback
  *
  * @api public
  */

  my.onDevices = function(fn) {
    ondevices = fn || function(){};
  };

  /**
  * Set up the callback to receive
  * devices presence.
  *
  * The callback must be prepare 
  * to receive an Object with the following
  * structure: 
  *
  * {  from: String, 
  *    resource: String, 
  *    ptype: String, 
  *    status: String, 
  *    show: String, 
  *    error: String } 
  *
  *
  * @param {Function} callback
  * 
  * @api public
  */ 

  my.onPresence = function(fn) {
    onpresence = fn || function(){};

    xmppsrv.addHandler(function(presence) {
      var from = $(presence).attr('from');
      var resource = Strophe.getResourceFromJid(from);
      var ptype = $(presence).attr('type') || 'available';
      var status = $(presence).find('status').text() || '';
      var show = $(presence).find('show').text() || '';
      var error = $(presence).find('error').text() || '';   
   
      //ignoring my own presence
      var me = barejid + '/' + config.resource + 
                '-jsapi-' + config.version;
      if(from == me) { 
        config.debug && console.log('ignoring my own presence'); 
        return true;
      }
  
      if(ptype == 'error') {
        console.log(from + ' Error: ' + error);
      } else {
        var data = {  from: from, 
                      resource: resource, 
                      ptype: ptype, 
                      status: status, 
                      show: show, 
                      error: error 
                    };

        onpresence(data);
      }

      return true; //needed to keep persistent this handler
    }, null, 'presence');

  };

  /**
  * Set up the callback to receive 
  * roster changes notifications 
  * 
  * The callback must be prepare to
  * receive an Object with the following
  * structure: 
  *
  * { jid: String, 
  *   subscription: String, 
  *   resource: String } 
  * 
  * @param {Function} callback
  *
  * @api public
  */

  my.onChange = function(fn) {
    onchange = fn || function(){};

    xmppsrv.addHandler(function(iq) {
      var item = $(iq).find('item');
      var jid = item.attr('jid');
      var resource = Strophe.getResourceFromJid(jid);
      var subscription = item.attr('subscription') || '';
              
      var change = {  jid: jid, 
                      subscription: subscription, 
                      resource: resource 
                    };

      onchange(change);
      
      // acknowledge receipt 
      xmppsrv.send($iq({type: 'result', id: $(iq).attr('id')}));
      
      return true; //needed to keep persistent this handler
    }, Strophe.NS.ROSTER, 'iq', 'set');

  };

  /**
  * Requests the roster 
  * and calls the onDevices callback 
  * with the items returned by the server 
  * 
  * @api public
  */

  my.get = function() {
    var rosterIQ = $iq({type: 'get'}).c('query', {xmlns: Strophe.NS.ROSTER});

    xmppsrv.sendIQ(rosterIQ, function(iq) {
      var devices = [];

      $(iq).find('item').each(function () {
        var jid = $(this).attr('jid');
        var name = $(this).attr('name') || '';
        var resource = Strophe.getResourceFromJid(jid) || '';
        var ask = $(this).attr('ask') || '';
        var subscription = $(this).attr('subscription') || 'none'; 

        var device = {  id: jid, 
                        name: name,
                        resource: resource,
                        ask: ask,
                        subscription: subscription
                    };
        //eventually this array has to be 
        //an array of Device objects
        devices.push(device);
      });
      
      ondevices(devices);
    });
  };

  /**
  * Adds a device to the roster
  * 
  * @api public
  */

  my.add = function(device) {
    var jid = barejid +'/'+ device;

    //add it to the roster
    var iq = $iq({type: 'set'})
                .c('query', {xmlns: Strophe.NS.ROSTER})
                .c('item', '', {jid: jid});
  
    xmppsrv.sendIQ(iq);

    //send request for presence subscription
    var presence = $pres({to: jid, 'type': 'subscribe'});
    xmppsrv.send(presence);
  };

  /**
  * Removes a device from the roster
  * 
  * @api public
  */

  my.remove = function(device) {
    var jid = barejid +'/'+ device;
  
    //unsubscribe presence
    var presence = $pres({to: jid, 'type': 'unsubscribe'}); 
    xmppsrv.send(presence);

    //remove from roster
    var iq = $iq({type: 'set'})
                .c('query', {xmlns: Strophe.NS.ROSTER})
                .c('item', {jid: jid, subscription: 'remove'}); 

    xmppsrv.sendIQ(iq);
  };


  return my;
};
