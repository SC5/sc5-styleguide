var gulp = require('gulp'),
    chai = require('chai'),
    expect = chai.expect,
    through = require('through2'),
    styleguide = require('requirefrom')('lib')('styleguide'),
    assertions = require('./assertions'),
    defaultSource = 'test/projects/scss-project/source/**/*.scss',
    defaultConfig = require('./test-config');

chai.config.includeStack = true;

function styleguideGenerateStream(source, config) {
  return gulp.src(source || defaultSource)
    .pipe(styleguide.generate(config || defaultConfig));
}

function styleguideApplyStylesStream() {
  return gulp.src('test/projects/shared-css/*')
    .pipe(styleguide.applyStyles());
}

// This collector collects all files from the stream to the array passed as parameter
function collector(collection) {
  return function(file, enc, cb) {
    if (!file.path) {
      return;
    }
    collection.push(file);
    cb();
  };
}

function findFile(files, name) {
  for (var i = files.length - 1; i >= 0; i--) {
    if (files[i].relative === name) {
      return files[i];
    }
  }
}

describe('index.html', function() {

  assertions.indexHtml.register();

  var indexHtml;

  before(function(done) {
    this.timeout(5000);
    var files = [];
    styleguideGenerateStream().pipe(
      through.obj(collector(files), function(callback) {
        indexHtml = findFile(files, 'index.html');
        assertions.indexHtml.set(indexHtml);
        callback();
        done();
      })
    );
  });

  it('should contain filesConfig passed as parameter and in correct format', function() {
    expect(indexHtml.contents.toString()).to.contain('var filesConfig = []');
  });

  it('should contain serialized styleguide configuration', function() {
    expect(indexHtml.contents.toString()).to.contain('var _styleguideConfig = {"title":"Test Styleguide"');
  });

  it('should not add extraHead to serialized configuration', function() {
    expect(indexHtml.contents.toString()).not.to.contain('"extreHead":');
  });
});

describe('styleguide_pseudo_styles.css', function() {

  assertions.pseudoStyles.register();

  before(function(done) {
    this.timeout(5000);
    var files = [];
    styleguideApplyStylesStream().pipe(
      through.obj(collector(files), function(callback) {
        var css = findFile(files, 'styleguide_pseudo_styles.css');
        assertions.pseudoStyles.set(css);
        callback();
        done();
      })
    );
  });

});

describe('styleguide_at_rules.css', function() {

  assertions.atRules.register();

  before(function(done) {
    this.timeout(5000);
    var files = [];
    styleguideApplyStylesStream().pipe(
      through.obj(collector(files), function(callback) {
        var css = findFile(files, 'styleguide_at_rules.css');
        assertions.atRules.set(css);
        callback();
        done();
      })
    );
  });

});

describe('sass/_styleguide_custom_variables.css', function() {

  assertions.styleguideCustomVariables.register();

  before(function(done) {
    this.timeout(5000);
    var files = [];
    styleguideGenerateStream().pipe(
      through.obj(collector(files), function(callback) {
        var css = findFile(files, 'css/_styleguide_custom_variables.css');
        assertions.styleguideCustomVariables.set(css);
        callback();
        done();
      })
    );
  });

});

describe('overview.html', function() {

  assertions.overviewHtml.register();

  before(function(done) {
    this.timeout(5000);
    var files = [];
    styleguideGenerateStream().pipe(
      through.obj(collector(files), function(callback) {
        var overviewHtml = findFile(files, 'overview.html');
        assertions.overviewHtml.set(overviewHtml);
        callback();
        done();
      })
    );
  });

});

describe('styleguide.css', function() {

  assertions.styleguideCss.register();

  before(function(done) {
    var files = [];
    styleguideApplyStylesStream().pipe(
      through.obj(collector(files), function(callback) {
        var css = findFile(files, 'styleguide.css');
        assertions.styleguideCss.set(css);
        callback();
        done();
      })
    );
  });

});

describe('styleguide-app.css', function() {
  assertions.appCss.register();

  before(function(done) {
    var files = [];
    styleguideGenerateStream().pipe(
      through.obj(collector(files), function(callback) {
        var css = findFile(files, 'styleguide-app.css');
        assertions.appCss.set(css);
        callback();
        done();
      })
    );
  });
});

describe('styleguide.json for SCSS project', function() {

  var source = 'test/projects/scss-project/source/**/*.scss',
      variablesFile = 'test/projects/scss-project/source/styles/_styleguide_variables.scss';

  assertions.styleguideJson.register();

  before(function(done) {
    var json = {};
    createStyleGuideJson(source, variablesFile, json, function() {
      assertions.styleguideJson.setJson(json.jsonData);
      assertions.styleguideJson.setVariablesFile(variablesFile);
      done();
    });
  });

});

describe('styleguide.json for LESS project', function() {

  var source = 'test/projects/less-project/source/**/*.less',
      variablesFile = 'test/projects/less-project/source/styles/_styleguide_variables.less';

  assertions.styleguideJson.register();

  before(function(done) {
    var json = {};
    createStyleGuideJson(source, variablesFile, json, function() {
      assertions.styleguideJson.setJson(json.jsonData);
      assertions.styleguideJson.setVariablesFile(variablesFile);
      done();
    });
  });

});

function createStyleGuideJson(source, variablesFile, _this, done) {
  var files = [],
    config = defaultConfig;

  config.styleVariables = variablesFile;
  styleguideGenerateStream(source, config).pipe(
    through.obj(collector(files), function(callback) {
      _this.jsonData = JSON.parse(findFile(files, 'styleguide.json').contents);
      callback();
      done();
    })
  );
}
