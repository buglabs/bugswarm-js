#!/usr/bin/env node

/**
 * Builder for Swarm Client Javascript Library. 
 * It merges files and creates distributable versions.
 * 
 **/

var fs = require('fs'),
sys = require('sys'),
uglify = require('uglify-js'),
path = require('path');

/* Configuration */
var config = {
    name: 'swarm',
    srcpath: 'lib',
    socketio_base: 'node_modules/socket.io-client/dist/',
    socketio_file: 'socket.io.js',
    socketio_cd: 'crossdomain.xml',
    socketio_swf: ['WebSocketMain.swf', 'WebSocketMainInsecure.swf'],
    distdir: 'dist',
    combine: ['swarm.js'],
    version: {
        major: '1',
        minor: '0',
        micro: '0',
        qualifier: 'beta'
    },
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

        if (fs.statSync(file).isDirectory()) {
            copytree(file, newdst);
        } else {
            copy(file, newdst);
        }
    }
};

function combine() {
    var api = '';
    var files = config.combine;
    var srcpath = config.srcpath;
    var distdir = config.distdir;

    for (var file in files) {
        api += '\n';
        api += fs.readFileSync(srcpath + '/' + files[file]);
    }

    var socketio = fs.readFileSync(config.socketio_base + '/' + config.socketio_file);

    if (!path.existsSync(distdir)) {
        fs.mkdirSync(distdir, 0755);
    }

    var release = socketio + '\n' + api;
    return release;
}

function minimize(code) {
    //uglify hate unicode chars...
    var separator = '@@OMGYUCHANGEME@@@';
    code = code.replace(/(\\ufffd)/g, separator);

    var ast = uglify.parser.parse(code);
    ast = uglify.uglify.ast_mangle(ast);
    ast = uglify.uglify.ast_squeeze(ast);

    code = uglify.uglify.gen_code(ast);

    // restore the code
    code = code.replace(new RegExp('('+ separator + ')', 'g'), '\\ufffd');
    
    return code;
}

// Builder Class
function Builder() {};

Builder.prototype.dist = function() {
    var version = config.version;
    var release = combine();
    var release_min = minimize(release);

    var name = config.name;
    var distdir = config.distdir;

    name += '-v' + version.major + 
            '.' + version.minor + 
            '.' + version.micro + 
            '.' + version.qualifier;

    fs.writeFileSync(distdir + '/' + name + '.js', release);
    fs.writeFileSync(distdir + '/' + name + '.min.js', release_min);

    for (var file in config.socketio_swf) {
        var src = config.socketio_base + '/' + config.socketio_swf[file];
        var dst = config.distdir + '/' + config.socketio_swf[file];
        copy(src, dst);
    }

    copy(config.srcpath + '/' + config.socketio_cd, config.distdir + '/' + config.socketio_cd);
};

/**
 * Arguments.
 */

var args = process.argv.slice(2);

/**
 * Usage information.
 */

var usage = '' + 
    '\x1b[1mUsage\x1b[0m: ./builder [task]\n' + 
    '\n' + 
    '\x1b[1mTasks:\x1b[0m\n' + 
    '  help  Print out instructions to use the builder\n' + 
    '  dist  Generates distributable version\n' + 
    '  jslint Runs JSlint to verify the code\n';

// Parse arguments
var arg;
var builder = new Builder();
var alength = args.length;
if (!alength) {
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
    case 'jslint':
        builder.doc();
        break;
    default:
        sys.puts(usage);
    }
}
