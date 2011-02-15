describe('Session', function() {
  var BugSwarm = BugLabs.BugSwarm;
  var session;
  
  it('should start', function(expect) {
    var username = 'test';
    var password = 'test';

    session = new BugSwarm.Session(username, password, {debug: true});
    session.start(function(status, error) {
      expect(status).equals(BugSwarm.Connection.CONNECTED);
      next();
    });
  });

  it('should provide the bare jabber id', function(expect) {
    expect('test@xmpp.bugswarm.net').equals(session.barejid());
    next();
  });

  it('should end', function(expect) {
    session.end(function(status, error) {
      expect(status).equals(BugSwarm.Connection.DISCONNECTED);
      next();
    });
  });
});
