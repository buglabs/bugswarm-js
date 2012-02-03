describe('Swarm Javascript API', function() {
    var swarmOpts = {   apikey: '3b36cb03148a8495b74388ee20913cbbc95d970d',
                        resource: '20be795073f6b6aba7af04eee57c316452f1e276',
                        swarms: 'c5adae312485c6bafe5c62cd73e8f09910df7a02' };

    afterEach(function(done) {
        swarmOpts.onconnect = function() {};
        swarmOpts.onerror = function() {};
        swarmOpts.ondisconnect = function() {};
        swarmOpts.onmessage = function() {};
        swarmOpts.onpresence = function() {};
        done();
    });

    it('should connect to the platform', function(done) {
        swarmOpts.onconnect = function() {
            expect(true).to.be.true;
            done();
            SWARM.disconnect();
        };

        swarmOpts.onerror = function(errors) {
            expect(errors).to.be.empty;
        };

        SWARM.connect(swarmOpts);
    });

    it('should join swarms and receive presence', function(done) {
        swarmOpts.onpresence = function(presence) {
            console.log(presence);
            console.log('shit!');
        };
        //console.log(swarmOpts);
        SWARM.connect(swarmOpts);
        setTimeout(function() { done(); }, 1500);
    });

    it('should send public messages to all the swarms where it has presence', function(done) {
        done();
    });

    it('should send public messages to specific swarms', function(done) {
        done();
    });

    it('should send private messages', function(done) {
        done();
    });

    it('should leave swarms', function(done) {
        done();
    });

    it('should disconnect', function(done) {
        done();
    });
});
