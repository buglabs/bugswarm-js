var Resource = require('../../bugswarm').configuration.Resource;
var ApiKey = require('../../bugswarm').configuration.ApiKey;

describe('Resource', function(){
    var resourceId;

    before(function(done) {
        ApiKey.initialize('librarytest', 'test');
        ApiKey.generate('configuration',
        function(err, apikey) {
            Resource.initialize(apikey.key);
            done();
        });
    });

    it('should create a resource', function(done) {
        var data = {
            name: 'my resource',
            description: 'my description',
            machine_type: 'bug'
        };

        Resource.create(data, function(err, resource) {
            resource.should.be.a('object');

            resource.should.have.property('id');
            resourceId = resource.id;

            resource.name.should.be.eql('my resource');
            resource.description.should.be.eql('my description');
            resource.machine_type.should.be.eql('bug');
            resource.should.have.property('created_at');
            done();
        });
    });

    it('should get a specific resource by id', function(done) {
        Resource.get(resourceId, function(err, resource) {
            resource.should.be.a('object');
            resource.should.have.property('id');
            resource.id.should.be.eql(resourceId);
            
            ['name', 'user_id', 'id', 'description', 'machine_type',
             'created_at'].forEach(function(p) {
                resource.should.have.property(p);
            });
            done();
        });
    });

    it('should update a resource', function(done) {
        Resource.get(resourceId, function(err, _resource) {
            _resource.name = 'my resource modified';
            _resource.description = 'my description modified';
            _resource.machine_type = 'pc';
            
            Resource.update(_resource, function(err, resource) {
                resource.should.be.a('object');
                resource.should.have.property('id');
                resource.id.should.be.eql(resourceId);
                resource.name.should.be.eql('my resource modified');
                resource.description.should.be.eql('my description modified');
                resource.machine_type.should.be.eql('pc');
                resource.should.have.property('created_at');
                resource.should.have.property('modified_at');
                done();
            });
        });
    });

    it('should get all the existing resources', function(done) {
        Resource.get(function(err, resources) {
            Array.isArray(resources).should.be.eql(true);
            resources.length.should.be.above(0);
            resources.forEach(function(resource) {
                ['name', 'user_id', 'id', 'description', 'machine_type',
                'created_at'].forEach(function(p) {
                    resource.should.have.property(p);
                });
            });
            done();
        });
    });

    it('should return the list of swarms where the resource is ' +
    'a participant', function(done) {
        Resource.swarms(resourceId, function(err, swarms) {
            Array.isArray(swarms).should.be.eql(true);
            swarms.length.should.be.eql(0);
            done();
        });
    });

    it('should destroy a resource', function(done) {
        Resource.destroy(resourceId, function(err) {
            //TODO
            //uncomment when https://github.com/visionmedia/should.js/issues/25
            //is fixed.
            //should.exist(err);
            done();
        });
    });
});