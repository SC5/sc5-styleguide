'use strict';

var fs = require('fs'),
  path = require('path'),
  childProcess = require('child_process'),
  chai = require('chai'),
  Q = require('q'),
  del = require('del'),
  chalk = require('chalk'),
  tmp = require('os').tmpDir(),
  currentDir = path.resolve(__dirname),
  styleGuideDir = path.resolve(currentDir, '../../'),
  testDir = path.join(tmp, 'sc5-package-smoketest' + Date.now()),
  sharedSrc = path.resolve(currentDir, '../projects/shared-css/'),
  npmSgDir = path.join(testDir, 'node_modules/sc5-styleguide'),
  MINUTE = 60000;

Q.longStackSupport = true;
chai.config.includeStack = true;

describe('npm package executable', function() {

  before(function(done) {
    this.timeout(3 * MINUTE);
    prepareTestDir().then(runNpmInstall).then(done).catch(done);
  });

  after(cleanUp);

  it('generates style guide from SASS test project without errors', function(done) {
    this.timeout(30000);
    generateScssTestProjectStyleGuide().then(done).catch(done);
  });

  it('generates style guide from LESS test project without errors', function(done) {
    this.timeout(30000);
    generateLessTestProjectStyleGuide().then(done).catch(done);
  });

  it('generates demo style guide without errors', function(done) {
    this.timeout(30000);
    generateDemoStyleGuide().then(done).catch(done);
  });

});

function prepareTestDir() {
  console.log(chalk.yellow('\n  Creating temp dir', testDir));
  return Q.promise(function(resolve, reject) {
    fs.mkdirSync(testDir);
    fs.createReadStream(path.join(currentDir, 'npm-package-test.json'))
      .pipe(fs.createWriteStream(path.join(testDir, 'package.json')))
      .on('close', resolve)
      .on('error', function(err) {
        reject(err.toString());
      });
  });
}

function runNpmInstall() {
  console.log(chalk.yellow('\n  Installing npm module to temp dir from', styleGuideDir));
  var args = ['install', styleGuideDir, '--color', 'true', '--spin', 'true'],
    opts = {
      cwd: testDir,
      env: process.env,
      stdio: 'inherit'
    };
  return spawn('npm', args, opts);
}

function generateScssTestProjectStyleGuide() {
  var sassSrc = path.resolve(currentDir, '../projects/scss-project/source/**/*.scss'),
    sassDest = path.join(testDir, 'scss-test-output'),
    args = ['-s', sassSrc, '-s', sharedSrc, '-o', sassDest];
  return generateStyleGuide(args);
}

function generateLessTestProjectStyleGuide() {
  var lessSrc = path.resolve(currentDir, '../projects/less-project/source/**/*.less'),
    lessDest = path.join(testDir, 'less-test-output'),
    args = ['-s', lessSrc, '-s', sharedSrc, '-o', lessDest];
  return generateStyleGuide(args);
}

function generateDemoStyleGuide() {
  var src = path.resolve(npmSgDir, 'lib/app'),
    dest = path.join(testDir, 'demo-test-output'),
    conf = path.resolve(npmSgDir, 'lib/app/styleguide_config.json'),
    args = ['-s', src, '-o', dest, '-c', conf];
  return generateStyleGuide(args);
}

function generateStyleGuide(args) {
  var opts = {
      cwd: npmSgDir,
      env: process.env,
      stdio: [process.stdin, process.stdout, 'pipe']
    };
  return spawn('bin/styleguide', args, opts);
}

function deleteTempDir() {
  console.log(chalk.yellow('Cleaning up temp dir', testDir));
  del.sync(path.join(testDir, '*'), { force: true });
  del.sync(testDir, { force: true });
}

function cleanUp() {
  deleteTempDir();
}

function spawn(cmd, args, opts) {
  var command = [cmd].concat(args).join(' ');
  return Q.promise(function(resolve, reject) {
    var error = '',
      proc = childProcess.spawn(cmd, args, opts),
      readError = function(err) {
        error += err.toString();
      };

    if (proc.stderr) {
      proc.stderr.on('data', readError);
    }
    proc.on('exit', function(code, signal) {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Command exited with non-zero: ' + (code || signal) + '\n' + command + '\n' + error));
      }
    });
  });
}
