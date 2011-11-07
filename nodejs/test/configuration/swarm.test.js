var Swarm = require('../../bugswarm').configuration.Swarm;
var Resource = require('../../bugswarm').configuration.Resource;
var ApiKey = require('../../bugswarm').configuration.ApiKey;

describe('Swarm', function(){
    var swarmId;
    var resource;

    before(function(done) {
        ApiKey.initialize('librarytest', 'test');
        ApiKey.generate('configuration',
        function(err, apikey) {
            Swarm.initialize(apikey.key);
            Resource.initialize(apikey.key);
            done();
        });
    });

    it('should create a swarm', function(done) {
        var data = {
            name: 'my swarm',
            public: false,
            description: 'my swarm description'
        };

        Swarm.create(data, function(err, swarm) {
            swarm.should.be.a('object');

            swarm.should.have.property('id');
            swarmId = swarm.id;

            swarm.name.should.be.eql('my swarm');
            swarm.public.should.be.eql(false);
            swarm.description.should.be.eql('my swarm description');

            Array.isArray(swarm.resources).should.be.eql(true);
            swarm.resources.length.should.be.eql(0);
            swarm.should.have.property('created_at');
            swarm.should.have.property('user_id');
            done();
        });
    });

    it('should get information by swarm id', function(done) {
        Swarm.get(swarmId, function(err, swarm) {
            swarm.should.be.a('object');
            swarm.should.have.property('id');
            swarm.id.should.be.eql(swarmId);

            ['name', 'user_id', 'id', 'description', 'public',
             'created_at'].forEach(function(p) {
                swarm.should.have.property(p);
            });
            done();
        });
    });

    it('should update swarm information', function(done) {
         Swarm.get(swarmId, function(err, _swarm) {
            _swarm.name = 'my swarm modified';
            _swarm.description = 'my description modified';
            _swarm.public = true;

            Swarm.update(_swarm, function(err, swarm) {
                swarm.should.be.a('object');
                swarm.should.have.property('id');
                swarm.id.should.be.eql(swarmId);
                swarm.name.should.be.eql('my swarm modified');
                swarm.description.should.be.eql('my description modified');
                swarm.public.should.be.eql(true);
                swarm.should.have.property('created_at');
                swarm.should.have.property('modified_at');
                done();
            });
        });
    });

    it('should get all the existing swarms', function(done) {
        Swarm.get(function(err, swarms) {
            Array.isArray(swarms).should.be.eql(true);
            swarms.length.should.be.above(0);
            swarms.forEach(function(swarm) {
                ['name', 'user_id', 'id', 'description', 'public',
                 'created_at', 'resources'].forEach(function(p) {
                    swarm.should.have.property(p);
                });
            });
            done();
        });
    });

    it('should add a resource', function(done) {
        var data = {
            name: 'my resource',
            description: 'my description',
            machine_type: 'bug'
        };

        Resource.create(data, function(err, _resource) {
            var options = {
                swarm_id: swarmId,
                resource_id: _resource.id,
                resource_type: 'consumer'
            };

            Swarm.addResource(options, function(err) {
                Swarm.get(swarmId, function(err, swarm) {
                    swarm.should.be.a('object');
                    swarm.should.have.property('resources');
                    Array.isArray(swarm.resources).should.be.eql(true);
                    swarm.resources.should.have.length(1);
                    var participant = swarm.resources[0];
                    participant.resource_type.should.be.eql(options.resource_type);
                    participant.resource_id.should.be.eql(options.resource_id);

                    ['resource_type', 'resource_id', 'member_since', 'url',
                     'user_id'].forEach(function(p) {
                        participant.should.have.property(p);
                    });

                    //global object
                    resource = {
                        id: _resource.id,
                        type: options.resource_type
                    };
                    done();
                });
            });
        });
    });

    it('should list swarm participants', function(done) {
        Swarm.resources(swarmId, function(err, resources) {
            Array.isArray(resources).should.be.eql(true);
            resources.should.have.length(1);
            done();
        });
    });

    it('should list consumer participants only', function(done) {
        Swarm.resources(swarmId, 'consumer', function(err, resources) {
            resources.forEach(function(r) {
                r.should.be.a('object');
                ['resource_type', 'resource_id', 'user_id',
                 'url', 'member_since'].forEach(function(p) {
                    r.should.have.property(p);
                });
                r.resource_type.should.be.eql('consumer');
                done();
            });
        });
    });

    it('should remove a resource', function(done) {
        var options = {
            swarm_id: swarmId,
            resource_id: resource.id,
            resource_type: resource.type
        };

        Swarm.removeResource(options, function(err) {
            Swarm.get(swarmId, function(err, swarm) {
                swarm.should.be.a('object');
                swarm.should.have.property('resources');
                Array.isArray(swarm.resources).should.be.eql(true);
                swarm.resources.should.have.length(0);
                done();
            });
        });
    });

    it('should list producer participants only', function(done) {
         var options = {
            swarm_id: swarmId,
            resource_id: resource.id,
            resource_type: 'producer'
        };

        Swarm.addResource(options, function(err) {
            Swarm.resources(swarmId, 'producer', function(err, resources) {
                resources.forEach(function(r) {
                    r.should.be.a('object');
                    ['resource_type', 'resource_id', 'user_id',
                    'url', 'member_since'].forEach(function(p) {
                        r.should.have.property(p);
                    });
                    r.resource_type.should.be.eql('producer');
                });
                done();
            });
        });
    });

    /*it('should send invitations', function(done) {
        done();
    });*/

    it('should destroy a swarm', function(done) {
        Swarm.destroy(swarmId, function(err) {
            Swarm.get(swarmId, function(err, swarm) {
                Array.isArray(err).should.be.eql(true);
                err.should.have.length(1);
                err[0].description.should.be.eql('Swarm not found.');
                done();
            });
        });
    });
});