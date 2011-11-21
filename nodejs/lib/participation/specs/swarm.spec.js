var ApiKeyService = require('../../configuration/apikey');
var SwarmService = require('../../configuration/swarm');
var ResourceService = require('../../configuration/resource');

var Swarm = require('../swarm');

describe('Swarm participation API', function() {
    var cfgKey,
        partKey,
        resourceId,
        swarmId,
        prosumerId,
        consumerId;

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

            consumerId = _resource.id;

            swarmService.addResource(options, function(err) {
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
                    message.from.swarm.should.be.eql(swarmId);
                    message.from.resource.should.be.eql(resourceId);
                    message.payload.should.be.eql('yo producer 1');
                    message.public.should.be.eql(true);
                    consumer.disconnect();
                    producer.disconnect();
                    done();
                });

                consumer.on('error', function(err) {
                    err[0].code.should.be.eql('056');
                    err[0].description.should.be.eql('Resource ' + consumerOptions.resource +
                    ' is not authorized to produce data in swarm ' + consumerOptions.swarms + '.');
                });

                consumer.on('presence', function(presence) {
                    //console.log(i + ') consumer received -> ' + JSON.stringify(presence));
                });

                consumer.on('connect', function() {
                    consumer.send('I should not be able to send this message');
                    //console.log('consumer ' + _resource.id + ' connected!');
                });

                consumer.connect();



                producer.on('message', function(message) {
                    //we need to fail if this callback gets called.
                    true.should.be.eql(false);
                });

                producer.on('presence', function(presence) {
                    if (presence.from.resource && 
                        !presence.type && //available
                        presence.from.resource == consumerOptions.resource) {
                        //lets send a message to the consumer once it shows up in
                        //the swarm.
                        producer.send('yo producer 1');
                    }
                    //console.log('producer received -> ' + JSON.stringify(presence));
                });

                producer.on('error', function(err) {
                    //we need to fail if this callback gets called.
                    console.log(err);
                    true.should.be.eql(false);
                });

                producer.on('connect', function() {
                    //console.log('producer ' + resourceId + ' connected!');
                });

                producer.connect();
            });
        });
    });

    it('should allow to connect a resource as producer and consumer', function(done) {
        var swarmService = new SwarmService(cfgKey);
        var resourceService = new ResourceService(cfgKey);

        var myresource = {
            name: 'my resource',
            description: 'This resource will produce and consume data.',
            machine_type: 'bug'
        };

        resourceService.create(myresource, function(err, _resource) {
            var options = {
                swarm_id: swarmId,
                resource_id: _resource.id,
                resource_type: 'consumer'
            };

            prosumerId = _resource.id;

            swarmService.addResource(options, function(err) {

                options.resource_type = 'producer';

                swarmService.addResource(options, function(err) {
                    var options = {
                        apikey: partKey,
                        resource: _resource.id,
                        swarms: swarmId
                    };

                    var interval;
                    var count = 0;

                    var prosumer = new Swarm(options);

                    prosumer.on('message', function(message) {
                        message.from.swarm.should.be.eql(swarmId);
                        message.from.resource.should.be.eql(_resource.id);
                        message.payload.should.be.eql('yo!');
                        count++;
                        if(count == 3) {
                            clearInterval(interval);
                            prosumer.disconnect();
                            done();
                        }
                    });

                    prosumer.on('presence', function(presence) {
                        if (presence.from.swarm &&
                            presence.from.swarm == swarmId &&
                            presence.from.resource == _resource.id) {

                            interval = setInterval(function() {
                                prosumer.send('yo!');
                            }, 500);
                        }
                    });

                    prosumer.on('error', function(err) {
                        true.should.be.eql(false);
                    });

                    prosumer.connect();
                });
            });
        });
    });

    it('should send and receive private messages', function(done) {
        var options = {
            apikey: partKey,
            resource: prosumerId,
            swarms: swarmId
        };

        var options2 = {
            apikey: partKey,
            resource: consumerId,
            swarms: swarmId
        };

        var prosumer = new Swarm(options);
        var consumer = new Swarm(options2);

        var interval;
        var count = 0;

        prosumer.on('presence', function(presence) {
            if(presence.from.resource == consumerId) {
                interval = setInterval(function() {
                    prosumer.send({ message: 'yo in private!',
                                    swarms: swarmId,
                                    resource: consumerId });
                }, 500);
            }
        });

        consumer.on('message', function(message) {
            //console.log(JSON.stringify(message));
            if (!message.public) {
                message.payload.should.be.eql('yo in private!');
                message.public.should.be.eql(false);
                message.from.swarm.should.be.eql(swarmId);
                message.from.resource.should.be.eql(prosumerId);
                count++;
                if(count == 3) {
                    clearInterval(interval);
                    consumer.disconnect();
                    prosumer.disconnect();
                    done();
                }
            }
        });

        consumer.connect();
        prosumer.connect();
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
