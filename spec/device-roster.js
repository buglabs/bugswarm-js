describe('Device Roster', function() {
  var BugSwarm = BugLabs.BugSwarm;
  var username = 'test';
  var password = 'test';
  
  var session = new BugSwarm.Session(username, password, {debug: true});
  var roster;

  before(function() {
    session.start(function(status, error) {
      roster = new BugSwarm.DeviceRoster(session);
      next();
    });
  });

  it('should receive presence', function(expect) {
    var session2 = new BugSwarm.Session('test2', 'test2', {debug: true});
    var config = session2.config();

    var handler = function(presence) {
      //test that the callback was called
      expect(true).equals(true);       
      
      //test that the callback was called 
      //with the expected presence object
      expect(presence).toHaveProperty('from');
      expect(presence).toHaveProperty('resource');
      expect(presence).toHaveProperty('ptype');
      expect(presence).toHaveProperty('status');
      expect(presence).toHaveProperty('show');
      expect(presence).toHaveProperty('error');
  
      expect(presence.from).equals('test2@xmpp.bugswarm.net/' + 
      config.resource + '-jsapi-' + config.version);
   
      roster.onPresence(function(){});
      session2.end();
      next();
    };
    
    roster.onPresence(handler);
 
    //initiating a new session with an user 
    //in the roster of test@xmpp.bugswarm.net
    session2.start(function() {
      expect(session2.barejid()).equals('test2@xmpp.bugswarm.net');
    });
  });

  it('should receive roster changes triggered by other clients modifying the roster', function(expect) {
    //setting up the roster changes handler
    var handler = function(change) {
      //test that the callback was called
      expect(true).equals(true); 
      
      expect(change).toHaveProperty('jid');
      expect(change).toHaveProperty('subscription');
      expect(change).toHaveProperty('resource');

      next();
    };

    roster.onChange(handler);
    roster.remove('mydevice1');
  });

  it('should get the devices in the roster', function(expect) {
    var handler = function(devices) {
      expect(true).equals(true);

      var test2 = devices[0];
      
      expect(test2).toHaveProperty('id');
      expect(test2).toHaveProperty('name');
      expect(test2).toHaveProperty('resource');
      expect(test2).toHaveProperty('ask');
      expect(test2).toHaveProperty('subscription');
      next();
    };
    roster.onDevices(handler);
    roster.get();
  });

  it('should add devices to the roster', function(expect) {
    var handler = function(change) {
      expect(change.resource).equals('mydevice');
      next();
    };
    roster.onChange(handler);
    roster.add('mydevice');
  });

  it('should remove devices from the roster', function(expect) {
    var handler = function(change) {
      if(change.subscription == 'remove') {
        expect(true).equals(true);
        roster.onChange(function(){});
        next();
      }
    };
    
    roster.onChange(handler);
    roster.remove('mydevice');
  });

  after(function() {
    session.end();
    next();
  });
});
