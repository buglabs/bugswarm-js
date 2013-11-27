describe('Swarm Javascript API', function() {
    var swarmOpts = {
        apikey: 'f6549bb4504c713e65011889fc28cdb04a2e8db0',
        resource: '4741f99a595bb0014ac6fa7e7668c0338c16a2c7',
        swarms: '2fbb71bb73b0b2159d0c8819b6883ae1a251b271'
    };

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
