var Resource = require('../../bugswarm').configuration.Resource;
var ApiKey = require('../../bugswarm').configuration.ApiKey;

describe('Resource', function(){
    var apikey;
    var resourceId;

    before(function(done) {
        new ApiKey('librarytest', 'test').generate('configuration',
        function(err, key) {
            apikey = key.key;
            done();
        });
    });

    it('should create a resource', function(done) {
        var data = {
            name: 'my resource',
            description: 'my description',
            machine_type: 'bug'
        };

        var _resource = new Resource(apikey, data);
        _resource.create(function(err, resource) {
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
        Resource.get(apikey, resourceId, function(err, resource) {
            resource.should.be.a('object');
            resource.should.have.property('id');
            resource.id.should.be.eql(resourceId);
            //console.log(resource);
            ['name', 'user_id', 'id', 'description', 'machine_type',
             'created_at'].forEach(function(p) {
                resource.should.have.property(p);
            });
            done();
        });
    });

    it('should update a resource', function(done) {
        Resource.get(apikey, resourceId, function(err, _resource) {
            _resource.name = 'my resource modified';
            _resource.description = 'my description modified';
            _resource.machine_type = 'pc';

            _resource.update(resourceId, function(err, resource) {
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
        Resource.get(apikey, function(err, resources) {
            Array.isArray(resources).should.be.eql(true);
            resources.length.should.be.above(1);
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
        Resource.get(apikey, resourceId, function(err, resource) {
            resource.swarms(function(err, swarms) {
                Array.isArray(swarms).should.be.eql(true);
                swarms.length.should.be.eql(0);
                done();
            });
        });
    });

    it('should destroy a resource', function(done) {
        Resource.destroy(apikey, resourceId, function(err) {
            //TODO
            //uncomment when https://github.com/visionmedia/should.js/issues/25
            //is fixed.
            //should.exist(err);
            done();
        });
    });
});