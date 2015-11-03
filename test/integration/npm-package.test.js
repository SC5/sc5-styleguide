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

describe('style guide generated with npm package executable', function() {

  before(function(done) {
    this.timeout(3 * MINUTE);
    prepareTestDir().then(runNpmInstall).then(done).catch(done);
  });

  after(function() {
    this.timeout(MINUTE);
    deleteTempDir();
  });

  describe('from SCSS test project', function() {
    var output = path.join(testDir, 'scss-test-output'),
      variablesFile = path.resolve(currentDir, '../projects/scss-project/source/styles/_styleguide_variables.scss');

    before(function(done) {
      this.timeout(30000);
      generateScssTestProjectStyleGuide(output, variablesFile).then(done).catch(done);
    });

    checkCommonStructure(output);
    addJsonAssertions(output, variablesFile);
  });

  describe('from LESS test project', function() {
    var output = path.join(testDir, 'less-test-output'),
      variablesFile = path.resolve(currentDir, '../projects/less-project/source/styles/_styleguide_variables.less');

    before(function(done) {
      this.timeout(30000);
      generateLessTestProjectStyleGuide(output, variablesFile).then(done).catch(done);
    });

    checkCommonStructure(output);
    addJsonAssertions(output, variablesFile);
  });

  describe('from plain CSS test project', function() {
    var output = path.join(testDir, 'css-test-output');

    before(function(done) {
      this.timeout(30000);
      generateCssTestProjectStyleGuide(output).then(done).catch(done);
    });

    checkCommonStructure(output);
  });

  describe('from JADE test project', function() {
    var output = path.join(testDir, 'jade-test-output');

    before(function(done) {
      this.timeout(30000);
      generateJadeTestProjectStyleGuide(output).then(done).catch(done);
    });

    checkCommonStructure(output);
    addJadeAssertions(output);
  });

  describe('from internal client files', function() {
    var output = path.join(testDir, 'demo-test-output');
    before(function(done) {
      this.timeout(30000);
      generateDemoStyleGuide(output).then(done).catch(done);
    });
    checkCommonStructure(output);
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

function generateScssTestProjectStyleGuide(output, variablesFile) {
  var args = getSharedConfig();
  args.kssSource = path.resolve(currentDir, '../projects/scss-project/source/**/*.scss');
  args.styleVariables = variablesFile;
  args.output = output;
  return generateStyleGuide(args);
}

function generateLessTestProjectStyleGuide(output, variablesFile) {
  var args = getSharedConfig();
  args.kssSource = path.resolve(currentDir, '../projects/less-project/source/**/*.less');
  args.styleVariables = variablesFile;
  args.output = output;
  return generateStyleGuide(args);
}

function generateCssTestProjectStyleGuide(output) {
  var args = getSharedConfig();
  args.kssSource = path.resolve(currentDir, '../projects/css-project/source/**/*.css');
  args.output = output;
  return generateStyleGuide(args);
}

function generateJadeTestProjectStyleGuide(output) {
  var args = getSharedConfig();
  args.enableJade = true;
  args.kssSource = path.resolve(currentDir, '../projects/jade-project/source/**/*.css');
  args.output = output;
  return generateStyleGuide(args);
}

function generateDemoStyleGuide(output) {
  var args = getSharedConfig();
  args.kssSource = path.resolve(npmSgDir, 'lib/app/**/*.scss');
  args.output = output;
  return generateStyleGuide(args);
}

function getSharedConfig() {
  var args = {
    styleSource: sharedSrc
  };

  Object.keys(testConfig).forEach(function(argName) {
    args[argName] = testConfig[argName];
  });
  return args;
}

function generateStyleGuide(args) {
  var opts = {
    cwd: npmSgDir,
    env: process.env,
    stdio: [process.stdin, process.stdout, 'pipe']
  }, argv = [];

  Object.keys(args).forEach(function(argName) {
    var value = args[argName];
    if (value instanceof Array) {
      value.forEach(function(v) {
        argv.push('--' + argName);
        argv.push(v);
      });
    } else {
      argv.push('--' + argName);
      argv.push(value);
    }
  });
  return spawn('bin/styleguide', argv, opts);
}

function deleteTempDir() {
  console.log(chalk.yellow('Cleaning up temp dir', testDir));
  del.sync(path.join(testDir, '*'), { force: true });
  del.sync(testDir, { force: true });
}

function spawn(cmd, args, opts) {
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
        var command = [cmd].concat(args).join(' ');
        reject(new Error('Command exited with non-zero: ' + (code || signal) + '\n' + command + '\n' + error));
      }
    });
  });
}

function checkCommonStructure(outputDir) {
  addAssertions(outputDir, 'index.html', assertions.indexHtml);
  addAssertions(outputDir, 'overview.html', assertions.overviewHtml);
  addAssertions(outputDir, 'styleguide_pseudo_styles.css', assertions.pseudoStyles);
  addAssertions(outputDir, 'styleguide_at_rules.css', assertions.atRules);
  addAssertions(outputDir, 'styleguide.css', assertions.styleguideCss);
}

function addAssertions(dir, fileName, assertion) {
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

function addJsonAssertions(dir, variablesFile) {
  describe('styleguide.json', function() {
    assertions.styleguideJson.register();
    before(function() {
      assertions.styleguideJson.setJson(getFile(dir, 'styleguide.json'));
      assertions.styleguideJson.setVariablesFile(variablesFile);
    });
  });
}

function addJadeAssertions(dir) {
  describe('JSON compilation', function() {
    assertions.jadeCompilation.register();
    before(function() {
      assertions.jadeCompilation.setJson(getFile(dir, 'styleguide.json'));
    });
  });
}
