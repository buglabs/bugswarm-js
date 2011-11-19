var ApiKeyService = require('../../configuration/apikey');
var SwarmService = require('../../configuration/swarm');
var ResourceService = require('../../configuration/resource');

var Swarm = require('../swarm');

describe('Swarm participation API', function() {
    var cfgKey,
        partKey,
        resourceId,
        swarmId;

    before(function(done) {
        var apikeyService = new ApiKeyService('librarytest', 'test');
        apikeyService.generate(function(err, data) {
            for(var i = 0, len = data.length; i < len; i++) {
                if(data[i].type == 'configuration') {
                    cfgKey = data[i].key;
                } else if(data[i].type == 'participation') {
                    partKey = data[i].key;
                }
            }

            var swarmService = new SwarmService(cfgKey);
            var resourceService = new ResourceService(cfgKey);

            var myswarm = {
                name: 'my swarm',
                public: false,
                description: 'my swarm description'
            };

            swarmService.create(myswarm, function(err, _swarm) {
                swarmId  = _swarm.id;
                var myresource = {
                    name: 'my resource',
                    description: 'my description',
                    machine_type: 'bug'
                };

                resourceService.create(myresource, function(err, _resource) {
                    resourceId = _resource.id;
                    var options = {
                        swarm_id: _swarm.id,
                        resource_id: _resource.id,
                        resource_type: 'producer'
                    };

                    swarmService.addResource(options, function(err) {
                        done();
                    });
                });
            });
        });
    });

    it('should allow to connect as a producer resource only', function(done) {
        var options = {
            apikey: partKey,
            resource: resourceId,
            swarms: swarmId
        };

        var producer = new Swarm(options);
        producer.on('message', function(message) {
            //we need to fail if this callback gets called.
            true.should.be.eql(false);
        });

        producer.on('error', function(err) {
            //we need to fail if this callback gets called.
            console.log(err);
            true.should.be.eql(false);
        });

        producer.on('connect', function(err) {
            producer.send('producing sensor data');
            producer.disconnect();
        });

        producer.on('presence', function(presence) {
            presence.from.resource.should.be.eql(resourceId);
        });

        producer.on('disconnect', function() {
            done();
        });

        producer.connect();
    });

    it('should allow to connect as a consumer resource only', function(done) {
        var swarmService = new SwarmService(cfgKey);
        var resourceService = new ResourceService(cfgKey);

        var myresource = {
            name: 'my consumer resource',
            description: 'my description',
            machine_type: 'bug'
        };

        resourceService.create(myresource, function(err, _resource) {
            var options = {
                swarm_id: swarmId,
                resource_id: _resource.id,
                resource_type: 'consumer'
            };

            swarmService.addResource(options, function(err) {
                var yay = false;

                var timeout = setTimeout(function() {
                    yay.should.be.eql(true);
                    consumer.disconnect();
                    producer.disconnect();
                    done();
                }, 30000);


                var consumerOptions = {
                    apikey: partKey,
                    resource: _resource.id,
                    swarms: swarmId
                };

                var producerOptions = {
                    apikey: partKey,
                    resource: resourceId,
                    swarms: swarmId
                };

                var producer = new Swarm(producerOptions);
                var consumer = new Swarm(consumerOptions);

                consumer.on('message', function(message) {
                    clearTimeout(timeout);
                    yay = true;
                    message.from.swarm.should.be.eql(swarmId);
                    message.from.resource.should.be.eql(resourceId);
                    message.payload.should.be.eql('yo producer 1');
                    message.public.should.be.eql(true);
                    consumer.disconnect();
                    producer.disconnect();
                    done();
                });

                consumer.on('error', function(err) {
                     //we need to fail if this callback gets called.
                    console.log(err);
                    true.should.be.eql(false);
                });
                var i = 0;
                consumer.on('presence', function(presence) {
                    i++;
                    console.log(i);
                    console.log('consumer received -> ' + JSON.stringify(presence));
                });

                consumer.on('connect', function() {
                    console.log('consumer ' + _resource.id + ' connected!');

                    producer.on('message', function(message) {
                        //we need to fail if this callback gets called.
                        true.should.be.eql(false);
                    });

                    producer.on('presence', function(presence) {
                        console.log('producer received -> ' + JSON.stringify(presence));
                    });

                    producer.on('error', function(err) {
                        //we need to fail if this callback gets called.
                        console.log(err);
                        true.should.be.eql(false);
                    });

                    producer.on('connect', function() {
                        console.log('producer ' + resourceId + ' connected!');
                        producer.send('yo producer 1');
                    });

                    producer.connect();
                });

                consumer.connect();
            });
        });
    });

    it('should allow to connect as producer and consumer', function(done) {
        done();
    });

    it('should connect, join and send messages to more than one swarm',
    function(done) {
        done();
    });

    it('should not lose messages if connection goes down', function(done) {
        done();
    });

    it('should re-connect if connection goes down', function(done) {
        done();
    });
});
