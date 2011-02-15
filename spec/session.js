describe('Session', function() {
  var BugSwarm = BugLabs.BugSwarm;
  var session;
  
  it('should start', function(expect) {
    var username = 'camilo';
    var password = 'camilo';

    session = new BugSwarm.Session(username, password, {debug: true});
    session.start(function(status, error) {
      expect(status).equals(session.connection().status.CONNECTED);
      next();
    });
  });

  it('should end', function(expect) {
    session.end(function(status, error) {
      expect(status).equals(session.connection().status.DISCONNECTED);
    });
  });
});


