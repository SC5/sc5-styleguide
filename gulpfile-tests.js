'use strict';

var vfs = require('vinyl-fs'),
  path = require('path'),
  plumber = require('gulp-plumber'),
  jscs = require('gulp-jscs'),
  jshint = require('gulp-jshint'),
  mocha = require('gulp-mocha'),
  karma = require('karma').server,
  coverage = require('istanbul'),
  istanbul = require('gulp-istanbul'),
  through = require('through2'),
  runSequence = require('run-sequence'),
  del = require('del'),
  tasks;

module.exports = function registerTasks(gulp) {
  Object.keys(tasks).forEach(function(task) {
    gulp.task(task, tasks[task]);
  });
};

tasks = {
  //jscs:disable disallowQuotedKeysInObjects
  'jscs': runJscs,
  'jshint': runJsHint,
  'lint:js': ['jscs', 'jshint'],
  'test:unit': runUnitTests,
  'test:integration': runIntegrationTests,
  'test:angular:unit': runAngularUnitTests,
  'test:angular:functional': runAngularFunctionalTests,
  'test:angular': ['test:angular:unit', 'test:angular:functional'],
  'test': runAllTests,
  'clean-coverage': cleanCoverageDir,
  'generate-coverage-report': generateCoverageReport
  //jscs:enable disallowQuotedKeysInObjects
};

function srcJsLint() {
  return vfs.src([
    'gulpfile.js',
    'gulp-tasks/*',
    'bin/**/*.js',
    'lib/**/*.js',
    'test/**/*.js',
    '!lib/dist/**/*.js',
    '!lib/app/js/components/**/*.js'
  ]);
}

function runJscs() {
  return srcJsLint()
    .pipe(plumber())
    .pipe(jscs({configPath: '.jscsrc'}));
}

function runJsHint() {
  return srcJsLint()
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
}

function runMocha() {
  return mocha({reporter: 'spec'});
}

function runUnitTests(done) {
  vfs.src(['lib/modules/**/*.js'])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      vfs.src(['test/unit/**/*.js'])
        .pipe(runMocha())
        .pipe(writeUnitTestCoverage())
        .pipe(printUnitTestCoverage())
        .on('end', done);
    });
}

function writeUnitTestCoverage() {
  return istanbul.writeReports({
    reporters: ['json'],
    reportOpts: {file: path.resolve('./coverage/unit-coverage.json')}
  });
}

function printUnitTestCoverage() {
  return istanbul.writeReports({reporters: ['text']});
}

function runIntegrationTests() {
  return vfs.src('test/integration/**/*.js').pipe(runMocha());
}

function runAngularUnitTests(done) {
  karma.start({
    configFile: path.resolve('./test/karma.conf.js'),
    exclude: ['test/angular/functional/**/*.js']
  }, done);
}

function runAngularFunctionalTests(done) {
  karma.start({
    configFile: path.resolve('./test/karma.conf.js'),
    exclude: ['test/angular/unit/**/*.js'],
    preprocessors: {},
    reporters: ['mocha']
  }, done);
}

function runAllTests(done) {
  runSequence('test:unit', 'test:angular', 'test:integration', 'lint:js', done);
}

function cleanCoverageDir(done) {
  del('coverage/*', done);
}

function generateCoverageReport() {
  var collector = new coverage.Collector(),
    lcov = coverage.Report.create('lcov', {dir: 'coverage'}),
    summary = coverage.Report.create('text');

  return vfs.src('coverage/*.json')
    .pipe(through.obj(function(file, enc, done) {
      collector.add(JSON.parse(file.contents.toString()));
      done();
    }, function(callback) {
      lcov.writeReport(collector);
      summary.writeReport(collector);
      callback();
    }));
}
