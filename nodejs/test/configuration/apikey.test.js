var ApiKey = require('../../bugswarm').configuration.ApiKey;

describe('ApiKey', function(){
    var user = 'librarytest';
    var password = 'test';
    var apikey;
    var confkey;
    var partkey;
    
    before(function(done) {
        ApiKey.initialize(user, password);
        done();
    });

    it('should generate configuration and participation keys', function(done){
        ApiKey.generate(function(err, keys) {
            Array.isArray(keys).should.be.true;
            keys.should.have.length(2);
            
            for(var i in keys) {
                ['user_id', 'created_at', 'status', 'type', 'key']
                .forEach(function(p) {
                   keys[i].should.have.property(p); 
                });
                keys[i].should.not.have.property('_id');
            }
            done();
        });
    });
    
    it('should generate only the configuration key', function(done) {
        ApiKey.generate('configuration', function(err, key) {
            key.should.be.a('object');
            
            ['user_id', 'created_at', 'status', 'type', 'key']
            .forEach(function(p) {
                key.should.have.property(p);
            });
            
            key.should.not.have.property('_id');
            key.type.should.be.eql('configuration');
            key.key.should.have.lengthOf(40).and.match(/^[a-fA-F0-9]+$/);
            
            confkey = key.key;
            done();
        });
    });
    
    it('should generate only the participation key', function(done) {
        ApiKey.generate('participation', function(err, key) {
            key.should.be.a('object');
            
            ['user_id', 'created_at', 'status', 'type', 'key']
            .forEach(function(p) {
                key.should.have.property(p);
            });
            
            key.should.not.have.property('_id');
            key.type.should.be.eql('participation');
            key.key.should.have.lengthOf(40).and.match(/^[a-fA-F0-9]+$/);
            
            partkey = key.key;
            done();
        });
    });
    
    it('should return an error if key type is invalid', function(done) {
        ApiKey.generate('invalid_type', function(err, key) {
            Array.isArray(err).should.be.true;
            err[0].message.should.be.eql('Instance is not one of the possible '+
            'values');
            err[0].attribute.should.be.eql('enum');
            err[0].details[0].should.be.eql('configuration');
            err[0].details[1].should.be.eql('participation');
            done();
        });
    });
    
    it('should return all the apikeys', function(done){
        ApiKey.get(function(err, keys) {
            Array.isArray(keys).should.be.true;
            keys.should.have.length(2);
            
            for(var i in keys) {
                ['user_id', 'created_at', 'status', 'type', 'key']
                .forEach(function(p) {
                   keys[i].should.have.property(p); 
                });
                keys[i].should.not.have.property('_id');
            }
            done();
        });
    });
    
    it('should return only the configuration key', function(done) {
        ApiKey.get('configuration', function(err, key) {
            key.should.be.a('object');
            
            ['user_id', 'created_at', 'status', 'type', 'key']
            .forEach(function(p) {
                key.should.have.property(p);
            });
            
            key.should.not.have.property('_id');
            key.type.should.be.eql('configuration');
            key.key.should.have.lengthOf(40).and.match(/^[a-fA-F0-9]+$/);
            
            key.key.should.be.eql(confkey);
            
            done();
        });
    });
       
    it('should return only the participation key', function(done) {
        ApiKey.get('participation', function(err, key) {
            key.should.be.a('object');
            
            ['user_id', 'created_at', 'status', 'type', 'key']
            .forEach(function(p) {
                key.should.have.property(p);
            });
            
            key.should.not.have.property('_id');
            key.type.should.be.eql('participation');
            key.key.should.have.lengthOf(40).and.match(/^[a-fA-F0-9]+$/);
            
            key.key.should.be.eql(partkey);
            
            done();
        });
    });
});