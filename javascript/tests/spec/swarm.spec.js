(function() {
  var participation_key, resources, swarms;
  swarms = ["17a98de7ae3ec0f55ccd4b266856de453ba4ea8e"];
  participation_key = "11b8cd10e071f98d97e2f4dcd44b5ef84ebff056";
  resources = ["82c05c2b50dda4b10f1981cf20f7cf06e54f5f54"];
  describe('SWARM', function() {
    describe('#connect', function() {
      it('can connect to swarm', function(done) {
        var errorHandler;
        console.log('testing swarm connection');
        SWARM.connect({
          apikey: participation_key,
          resource: resources[0],
          swarms: swarms[0],
          onerror: errorHandler,
          onconnect: function(done) {
            console.log('connected');
            done();
          }
        });
        errorHandler = function(error) {
          return console.log('ERROR', error);
        };
      });
      return it('can recieve presence', function(done) {
        SWARM.connect({
          apikey: participation_key,
          resource: resources[0],
          swarms: swarms[0],
          onpresence: function(stanza) {
            console.log('OHAI');
            console.log(stanza.presence);
            done();
          }
        });
      });
    });
    it('can push data to a swarm', function() {
      return expect(false).toBeTruthy();
    });
    it('can recieve its own messages', function() {
      return expect(false).toBeTruthy();
    });
    it('can recieve messages and who it came from', function() {
      return expect(false).toBeTruthy();
    });
    it('is alerted of new participants', function() {
      return expect(false).toBeTruthy();
    });
    return it('is alerted of current participants upon joining', function() {
      return expect(false).toBeTruthy();
    });
  });
}).call(this);
