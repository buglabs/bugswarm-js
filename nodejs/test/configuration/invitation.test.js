var ApiKeyService = require('../../bugswarm').configuration.ApiKeyService;
var InvitationService = require('../../bugswarm').configuration.InvitationService;
var SwarmService = require('../../bugswarm').configuration.SwarmService;
var ResourceService = require('../../bugswarm').configuration.ResourceService;

describe('Invitation service', function() {
    //this is ugly
    var swarmId;
    var resourceId;
    var apikeyService;
    var apikey2Service;
    var invitationService;
    var invitation2Service;
    var swarmService;
    var resourceService;

    before(function(done) {
        apikeyService = new ApiKeyService('librarytest', 'test');
        apikey2Service = new ApiKeyService('librarytest2', 'test');

        apikeyService.generate('configuration',
        function(err, apikey) {
            swarmService = new SwarmService(apikey.key);
            invitationService = new InvitationService(apikey.key);

            apikey2Service.generate('configuration',
            function(err, apikey2) {
                resourceService = new ResourceService(apikey2.key);
                invitation2Service = new InvitationService(apikey2.key);

                var data = {
                    name: 'my swarm',
                    public: false,
                    description: 'my swarm description'
                };

                swarmService.create(data, function(err, swarm) {
                    swarm.should.have.property('id');
                    swarmId = swarm.id;

                    var data = {
                        name: 'my resource',
                        description: 'my description',
                        machine_type: 'bug'
                    };

                    resourceService.create(data, function(err, resource) {
                        resource.should.have.property('id');
                        resourceId = resource.id;
                        done();
                    });
                });
            });
        });
    });

    it('should send invitations', function(done) {
        var _invitation = {
            to: 'librarytest2',
            resource_id: resourceId,
            resource_type: 'producer',
            description: 'Hey feel free to produce information in my Swarm.'
        };

        invitationService.send(swarmId, _invitation, function(err, invitation) {
            invitation.should.be.a('object');
            invitation.should.have.property('id');
            invitation.swarm_id.should.be.eql(swarmId);
            done();
        });
    });

    /*it('should list sent invitations by swarm', function(done) {
        invitationService.get('sent', swarmId, function(err, invitations) {
            Array.isArray(invitations).should.be.eql(true);
            invitations.should.be.above(0);
            invitations.forEach(function(i) {
                i.should.have.property('from');
                i.from.should.be.eql('librarytest');
                i.swarm_id.should.be.eql(swarmId);
            });
            done();
        });
    });

    it('should list all the sent invitations', function(done) {
        invitationService.get('sent', function(err, invitations) {
            Array.isArray(invitations).should.be.eql(true);
           done();
        });
    });

    it('should list all the received invitations', function(done) {
        invitation2Service.get('received', function(err, invitations) {
            done();
        });
    });

    it('should list received invitations by resource id', function(done) {
        invitation2Service.get('received', resourceId, function(err, invitations) {
            done();
        });
    });

    it('should reject invitations', function(done) {
        invitation2Service.reject(invitationId, function(err, invitation) {
            done();
        });
    });

    it('should accept invitations', function(done) {
         var invitation = {
            to: 'librarytest2',
            resource_id: resourceId,
            resource_type: 'producer',
            description: 'Hey feel free to produce information in my Swarm.'
        };

        invitationService.send(swarmId, invitation, function(err, invitation) {
            invitation.should.be.a('object');
            invitation.should.have.property('id');

            invitation2Service.accept(invitation.id, function(err, invitation) {
                done();
            });
        });
    });*/
});