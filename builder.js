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
    combine: ['util.js', 'swarm.js'],
    version: {
        major: '0',
        minor: '7',
        micro: '2',
        qualifier: ''
    },
    servers: [ //development
        {   'env': 'dev',
            'api': 'stream.dev.bugswarm.com'
        },
        { //staging
            'env': 'staging',
            'api': 'stream.staging.bugswarm.com'
        },
        { //test
            'env': 'test',
            'api': 'stream.test.bugswarm.com'
        },
        { //production
            'env': 'prod',
            'api': 'stream.bugswarm.com'
        }
    ]
};

//Utility functions
function copy(src, dst) {
    if (!fs.existsSync(src)) {
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
    if (!fs.existsSync(src)) {
        throw new Error(src + ' does not exists. Nothing to be copied');
    }

    if (!fs.statSync(src).isDirectory()) {
        throw new Error(src + ' must be a directory');
    }

    var filenames = fs.readdirSync(src);
    var basedir = src;

    if (!fs.existsSync(dst)) {
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
}

var rlevel = 0;
var root;
function rmtree(_path) {
    if (fs.statSync(_path).isFile()) {
        throw new Error(_path + ' is a file. Use fs.unlink instead');
    }
    if (!root) {
        root = _path;
    }
    var filenames = fs.readdirSync(_path);
    var basedir = _path;

    for (var name in filenames) {
        var file = basedir + '/' + filenames[name];

        if (fs.statSync(file).isDirectory()) {
            rlevel++;
            rmtree(file);
            rlevel--;

            fs.rmdirSync(file);
        } else {
            fs.unlinkSync(file);
        }
    }

    if (rlevel === 0 && fs.existsSync(root)) {
        fs.rmdirSync(root);
    }
}

function combine() {
    var api = '';
    var files = config.combine;
    var srcpath = config.srcpath;
    var distdir = config.distdir;

    var len = files.length;
    for (var i = 0; i < len; i++) {
        api += '\n';
        api += fs.readFileSync(srcpath + '/' + files[i]);
    }

    var socketio = fs.readFileSync(config.socketio_base + '/' + config.socketio_file);

    if (!fs.existsSync(distdir)) {
        fs.mkdirSync(distdir, 0755);
    }

    var release = socketio + '\n' + api;
    return release;
}

function minimize(code) {
    var ast = uglify.parser.parse(code);
    ast = uglify.uglify.ast_mangle(ast);
    ast = uglify.uglify.ast_squeeze(ast);

    code = uglify.uglify.gen_code(ast, {ascii_only: true});

    return code;
}

// Builder
function Builder() {}

Builder.prototype.dist = function() {
    var version = config.version;
    var release = combine();

    var name = config.name;
    name += '-v' + version.major + '.' + version.minor +
            '.' + version.micro;

    if(version.qualifier !== '') {
        name += '.' + version.qualifier;
    }

    var distdir = config.distdir;

    rmtree('./' + distdir);
    fs.mkdirSync('./' + distdir, 0755);

    var servers = config.servers;
    var len = servers.length;
    for(var i = 0; i < len; i++) {
        var _release = release.replace(/@@API_SERVER@@/ig, servers[i].api);
        _release = _release.replace(/@@XMPP_SERVER@@/ig, servers[i].xmpp);

        var release_min = minimize(_release);

        var envdir = distdir + '/' + servers[i].env;
        if(!fs.existsSync(envdir)) {
            fs.mkdirSync(envdir, 0755);
        }

        fs.writeFileSync(envdir + '/' + name + '.js', _release);
        fs.writeFileSync(envdir + '/' + name + '.min.js', release_min);

        for (var file in config.socketio_swf) {
            var src = config.socketio_base + '/' + config.socketio_swf[file];
            var dst = envdir + '/' + config.socketio_swf[file];
            copy(src, dst);
        }

        copy(config.srcpath + '/' + config.socketio_cd, envdir + '/' + config.socketio_cd);
    }
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

