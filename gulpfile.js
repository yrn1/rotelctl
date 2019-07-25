const { src, dest, series, parallel } = require('gulp');
const mocha = require('gulp-mocha');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const debug = require('debug');
const gulpdoc = require('./gulpdoc');

function lint() {
  return src(['*.js', '*.json', 'lib/*.js', 'public/js/*.js', 'test/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
}


function enableDebug() {
  debug.enable('rotelctl*');
}

function test() {
  return src(['test/*.js'], { read: false })
    .pipe(mocha({ reporter: 'spec' }));
}

function doc() {
  return src(['README.src'])
    .pipe(gulpdoc('./lib/commands'))
    .pipe(dest('.'));
}

exports.lint = lint;
exports.enableDebug = enableDebug;
exports.test = test;
exports.doc = doc;
exports.debug = series(enableDebug, test);
exports.default = series(lint, test, doc);