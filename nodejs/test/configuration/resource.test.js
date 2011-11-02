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
    
    it('should update a resource', function(done) {
        var data = {
            name: 'my resource modified',
            description: 'my description modified',
            machine_type: 'pc'
        };

        var _resource = new Resource(apikey, data);
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
    
    it('should destroy a resource', function(done) {
        done();
    });
    
    it('should get all the existing resources', function(done) {
        done();
    });
    
    it('should get a specific resource by id', function(done) {
        done();
    });
    
    it('should return the list of swarms where the resource is ' +
    'a participant', function(done) {
        done();
    });
});