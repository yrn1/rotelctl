"use strict";

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var debug = require('debug');
var gulpdoc = require('./gulpdoc');

gulp.task('lint', function() {
  return gulp.src(['*.js', '*.json', 'lib/*.js', 'public/js/*.js', 'test/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});


gulp.task('enableDebug', function() {
  debug.enable('rotelctl*');
});

gulp.task('test', function() {
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec',
      globals: {}
    }));
});

gulp.task('doc', function() {
  return gulp.src(['README.src'])
    .pipe(gulpdoc('./lib/commands'))
    .pipe(gulp.dest('.'));
});

gulp.task('debug', ['enableDebug', 'test']);

gulp.task('default', ['lint', 'test', 'doc']);