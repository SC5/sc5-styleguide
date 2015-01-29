'use strict';

var fs = require('fs'),
  path = require('path'),
  childProcess = require('child_process'),
  chai = require('chai'),
  Q = require('q'),
  del = require('del'),
  chalk = require('chalk'),
  tmp = require('os').tmpDir(),
  testConfig = require('./test-config'),
  assertions = require('./assertions'),
  currentDir = path.resolve(__dirname),
  styleGuideDir = path.resolve(currentDir, '../../'),
  testDir = path.join(tmp, 'sc5-package-smoketest' + Date.now()),
  sharedSrc = path.resolve(currentDir, '../projects/shared-css/*.css'),
  npmSgDir = path.join(testDir, 'node_modules/sc5-styleguide'),
  MINUTE = 60000;

Q.longStackSupport = true;
chai.config.includeStack = true;

describe('npm package executable', function() {

  before(function(done) {
    this.timeout(3 * MINUTE);
    prepareTestDir().then(runNpmInstall).then(done).catch(done);
  });

  after(function() {
    this.timeout(MINUTE);
    deleteTempDir();
  });

  describe('generated style guide from SCSS test project', function() {
    var output = path.join(testDir, 'scss-test-output');
    before(function(done) {
      this.timeout(30000);
      generateScssTestProjectStyleGuide(output).then(done).catch(done);
    });
    checkStructure(output);
  });

  describe('generated style guide from LESS test project', function() {
    var output = path.join(testDir, 'less-test-output');
    before(function(done) {
      this.timeout(30000);
      generateLessTestProjectStyleGuide(output).then(done).catch(done);
    });
    checkStructure(output);
  });

  describe('generated demo style guide', function() {
    var output = path.join(testDir, 'demo-test-output');
    before(function(done) {
      this.timeout(30000);
      generateDemoStyleGuide(output).then(done).catch(done);
    });
    checkStructure(output);
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

function generateScssTestProjectStyleGuide(output) {
  var scssSrc = path.resolve(currentDir, '../projects/scss-project/source/**/*.scss'),
    args = joinSharedConfig(['--kssSource', scssSrc, '--output', output]);
  return generateStyleGuide(args);
}

function generateLessTestProjectStyleGuide(output) {
  var lessSrc = path.resolve(currentDir, '../projects/less-project/source/**/*.less'),
    args = joinSharedConfig(['--kssSource', lessSrc, '--output', output]);
  return generateStyleGuide(args);
}

function generateDemoStyleGuide(output) {
  var src = path.resolve(npmSgDir, 'lib/app/**/*.scss'),
    args = joinSharedConfig(['--kssSource', src, '--output', output]);
  return generateStyleGuide(args);
}

function joinSharedConfig(args) {
  args.push('--styleSource');
  args.push(sharedSrc);

  Object.keys(testConfig).forEach(function(argName) {
    var value = testConfig[argName];
    if (value instanceof Array) {
      value.forEach(function(v) {
        args.push('--' + argName);
        args.push(v);
      });
    } else {
      args.push('--' + argName);
      args.push(value);
    }
  });
  return args;
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

function spawn(cmd, args, opts) {
  var command = [cmd].concat(args).join(' ');

  console.log('cwd:', opts.cwd);
  console.log('Executing command:', command);

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

function checkStructure(outputDir) {
  addAssertion(outputDir, 'index.html', assertions.indexHtml);
  addAssertion(outputDir, 'styleguide_pseudo_styles.css', assertions.pseudoStyles);
  addAssertion(outputDir, 'styleguide_at_rules.css', assertions.atRules);
}

function addAssertion(dir, fileName, assertion) {
  describe(fileName, function() {
    assertion.register();
    before(function() {
      assertion.set(getFile(dir, fileName));
    });
  });
}

function getFile(dir, fileName) {
  var buffer = fs.readFileSync(path.join(dir, fileName));
  return { contents: buffer };
}
