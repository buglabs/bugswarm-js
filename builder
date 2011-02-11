#!/usr/bin/env node

/* Temporary project builder 
* we are creating bugswarm-builder
* which will be more robust and complete
*
*/

var fs = require('fs'),
    sys = require('sys'),
    path = require('path');

/* Configuration */ 

var config = {
  name: 'bugswarm',
  srcpath: 'src',
  depspath: 'lib',
  flxhrpath: 'lib/flxhr',
  basefile: 'src/base.js',
  distdir: 'dist',
  combine: { api: [ 'config.js', 
                    'connection.js',
                    'session.js',
                    'device.js',
                    'device-service.js',
                    'device-model.js',
                    'device-roster.js',
                    'swarm.js'
                  ],
             deps: [ 'jquery.js',
                     'strophe.js',
                     'strophe.pubsub.js',
                     'buglabs/strophe.flxhr.js'
                   ]
            },
  jquery: true,
  version: { major: '1', 
             minor: '0',
             micro: '0',
             qualifier: 'beta'}, 
  
  doc: { title: 'BugSwarm', 
         desc: 'Javascript API' }
};



//Utility functions
function copy(src, dst) {
    if (!path.existsSync(src)) {
        throw new Error(src + ' does not exists. Nothing to be copied');
    }

    if (fs.statSync(src).isDirectory()) {
        throw new Error(src + ' is a directory. It must be a file');
    }

    if (src == dst) {
        throw new Error(src + ' and ' + dst + 'are identical');
    }

    var infd = fs.openSync(src, 'r');
    var size = fs.fstatSync(infd).size;
    var outfd = fs.openSync(dst, 'w');

    fs.sendfileSync(outfd, infd, 0, size);

    fs.closeSync(infd);
    fs.closeSync(outfd);
}

function copytree(src, dst) {
    if (!path.existsSync(src)) {
        throw new Error(src + ' does not exists. Nothing to be copied');
    }

    if (!fs.statSync(src).isDirectory()) {
        throw new Error(src + ' must be a directory');
    }

    var filenames = fs.readdirSync(src);
    var basedir = src;

    if (!path.existsSync(dst)) {
        fs.mkdirSync(dst, 0755);
    }

    for (var name in filenames) {
        var file = basedir + '/' + filenames[name];
        var newdst = dst + '/' + filenames[name];

        if(fs.statSync(file).isDirectory()) {
            copytree(file, newdst);
        } else {
            copy(file, newdst);
        }
    }
};

// Builder Class
function Builder() {

};

Builder.prototype.dist = function() {
  //if jslint or tests complain don't generate the release
  this.jslint();
  this.test();

  var version = config.version;
  var releases = this._combine();

  var name = config.name;
  var distdir = config.distdir;

  name += '-v' + 
          version.major + 
          '.' + 
          version.minor + 
          '.' + 
          version.micro +
          '.' + 
          version.qualifier;

  fs.writeFileSync(distdir + '/' + name + '-jquery.js', releases.regular);
  fs.writeFileSync(distdir + '/' + name + '.js', releases.nojquery);
  
  copytree(config.flxhrpath, distdir + '/flxhr');

};

Builder.prototype._combine = function() {
  var depfiles = '';
  var depfiles2 = '';
  var files = '';
  var api = config.combine.api;
  var deps = config.combine.deps;
  var srcpath = config.srcpath;
  var depspath = config.depspath;
  var distdir = config.distdir;


  for(var file in api) {
    files += '\n';
    files += fs.readFileSync(srcpath + '/' + api[file]);
  }

  for(var file in deps) {
    var content = fs.readFileSync(depspath + '/' + deps[file]);
    
    depfiles += '\n';
    depfiles += content;

    if(deps[file].match('jquery')) {
      continue;
    }
    depfiles2 += '\n';
    depfiles2 += content;
  }

  var basefile = fs.readFileSync(config.basefile, 'utf8');
  
  basefile = basefile.replace('@@BUGSWARM@@', files);
  var nojquery = basefile;

  basefile = basefile.replace('@@DEPS@@', depfiles);
  
  nojquery = nojquery.replace('@@DEPS@@', depfiles2);

  if(!path.existsSync(distdir)) {
    fs.mkdirSync(distdir, 0755);
  }

  return { nojquery: nojquery,
           regular: basefile
          };  
};

Builder.prototype.jslint = function() {
  //TODO
};

Builder.prototype.test = function() {
  //TODO
};


/**
 * Arguments.
 */

var args = process.argv.slice(2);


/**
 * Usage information.
 */

var usage = ''
    + '\x1b[1mUsage\x1b[0m: ./builder [task]\n'
    + '\n'
    + '\x1b[1mTasks:\x1b[0m\n'
    + '  help  Print out instructions to use the builder\n'
    + '  dist  Generates distributable version\n'
    + '  test  Runs the tests\n'
    + '  jslint Runs JSlint to verify the code\n';



// Parse arguments

var arg;
var builder = new Builder();
var alength = args.length;
if(!alength) {
  sys.puts(usage);
  process.exit(1);
} 

while (args.length) {
    arg = args.shift();
    switch (arg) {
        case 'help':
            sys.puts(usage);
            process.exit(1);
            break;
        case 'dist':
            builder.dist();
            break;
        case 'test':
            builder.test();
            break;
        case 'doc': 
            builder.doc();
            break;
        default:
            sys.puts(usage);
    }
}


