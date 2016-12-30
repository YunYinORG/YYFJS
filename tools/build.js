#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var config = require('./config.js');


function getSize(code) {
    return (code.length / 1024).toFixed(4) + 'Kb';
}

function save(file, data) {
    var folder = path.dirname(file);
    folder.split('/').forEach(function(dir, i, dirs) {
        dir = path.resolve(dirs.slice(0, i + 1).join('/'));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });
    console.log(file + ': [' + getSize(data) + ']');
    fs.writeFileSync(file, data);
}

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "minify" }]*/
function minify(file, config) {
    var code = fs.readFileSync(config.INPUT).toString();
    console.log(file + ' (input): [' + getSize(code) + ']');
    var minified = uglify.minify(code, {
        fromString: true,
        mangle: true,
        // nameCache: 'yyf',
        // mangleProperties: { regex: /^_/ },
        output: {
            // ascii_only: false,
            beautify: true,
            screw_ie8: true
        },
        compress: {
            sequences: false,
            dead_code: false,
            evaluate: false,
            conditionals: false,
            comparisons: false,
            booleans: false,
            drop_debugger: false,
            if_return: false,
            join_vars: false,
            unused: true,
            drop_console: true
        }
    }).code;
    return (config.banner || '') + minified;
}

function build(from, banner) {
    var code = fs.readFileSync(from).toString();
    code = code.replace(/var\W*DEBUG\W*=\W*true/, '//remove debug')
        .replace(/(else )?if\W*\(\W*DEBUG\W*\)\W*\{[\w\W]*?\}/g, '/* remove debug */\n');
    return (banner || '') + code;
}

save(config.OUTPUT, build(config.INPUT, config.BANNER));