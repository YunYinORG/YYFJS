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
    folder.split('/').forEach(function (dir, i, dirs) {
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


function tsd(typesfile) {
    var types = fs.readFileSync(typesfile).toString();
    var module_declare = 'declare const YYF: yyfjs.YYF;\ndeclare module "yyfjs" { export = YYF; }';
    var XMLHttpRequest_reg = /\/\*\*\s*\*\s+@typedef\s+\{XMLHttpRequest\}[\s\S]*XMLHttpRequest\s?\=\s?XMLHttpRequest\;/;
    types = types.replace(XMLHttpRequest_reg, module_declare);

    var optional_reg = /\"\w+\?\"/g;
    types = types.replace(optional_reg, function (s) {
        return s.substring(1, s.length - 1);
    });

    var config_reg = /\s*config\(.+[\w\W]*?\)\W?\:\W+YYF\;/;
    types = types.replace(config_reg, function (s) {
        return s + s.replace('config', '');
    });
    return types;
}
save(config.OUTPUT, build(config.INPUT, config.BANNER));
var typesfile = config.LIB + '/types.d.ts';
save(config.LIB + '/yyf.d.ts', tsd(typesfile));
fs.unlink(typesfile);

