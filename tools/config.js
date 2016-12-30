'use strict';

var path = require('path');
var pkg = require('../package.json');

var version = process.env.VERSION || pkg.version;
var lib = path.resolve(__dirname, '../lib/');
var output = process.env.output || path.resolve(__dirname, '../' + pkg.main);
var input = path.resolve(__dirname, '../src/yyf.js');
var banner = '/*!\n' +
    ' * YYFJS v' + version + '\n' +
    ' * (c)2016-' + new Date().getFullYear() + ' NewFuture@yunyin.org\n' +
    ' * Apache License.\n' +
    ' */\n';

module.exports = {
    VERSION: version,
    BANNER: banner,
    LIB: lib,
    INPUT: input,
    OUTPUT: output
};