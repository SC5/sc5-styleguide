var gulp = require('gulp'),
    chai = require('chai'),
    expect = chai.expect,
    through = require('through2'),
    path = require('path'),
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
      through.obj({objectMode: true}, collector(files), function(callback) {
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

});

describe('styleguide_pseudo_styles.css', function() {
  
  assertions.pseudoStyles.register();

  before(function(done) {
    this.timeout(5000);
    var files = [];
    styleguideApplyStylesStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        var styleguideFile = findFile(files, 'styleguide_pseudo_styles.css');
        assertions.pseudoStyles.set(styleguideFile);
        callback();
        done();
      })
    );
  });

});

describe('styleguide_at_rules.css', function() {
  var styleguideFile;
  this.timeout(5000);

  before(function(done) {
    var files = [];
    styleguideApplyStylesStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        styleguideFile = findFile(files, 'styleguide_at_rules.css');
        callback();
        done();
      })
    );
  });

  it('should exist', function() {
    expect(styleguideFile).to.be.an('object');
  });

  it('should contain at rules', function() {
    expect(styleguideFile.contents.toString()).to.contain('@keyframes myanimation {');
  });

  it('should not contain content from sourcemaps file', function() {
    expect(styleguideFile.contents.toString()).not.to.contain('{{test.map content}}');
  });
});

describe('overview.html', function() {
  var overviewHtml;
  this.timeout(5000);

  before(function(done) {
    var files = [];

    styleguideGenerateStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        overviewHtml = findFile(files, 'overview.html');
        callback();
        done();
      })
    );
  });

  it('should exist', function() {
    expect(overviewHtml).to.be.an('object');
  });

  it('should have valid headers with sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<h1 class="sg heading">Title1</h1>');
    expect(overviewHtml.contents.toString()).to.contain('<h2 class="sg heading">Title2</h2>');
  });

  it('should have valid paragraph with sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<p class="sg">Ut turkish, wings, sit to go barista half');
  });

  it('should escape code snippets and add sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<pre class="sg"><code>&lt;div class=&quot;foobar&gt;Test code snippet&lt;/div&gt;\n</code></pre>');
  });

  it('should have valid links with sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<a class="sg" href="http://example.com">Example link</a>');
  });
});

function sharedStyleguideJSON() {
  it('should exist', function() {
    expect(this.jsonData).to.be.an('object');
  });

  it('should contain correct title', function() {
    expect(this.jsonData.config.title).to.eql('Test Styleguide');
  });

  it('should contain correct appRoot', function() {
    expect(this.jsonData.config.appRoot).to.eql('/my-styleguide-book');
  });

  it('should contain extra heads in correct format', function() {
    expect(this.jsonData.config.extraHead).to.eql(defaultConfig.extraHead[0] + '\n' + defaultConfig.extraHead[1]);
  });

  it('should contain all common classes', function() {
    expect(this.jsonData.config.commonClass).to.eql(['custom-class-1', 'custom-class-2']);
  });

  it('should contain all style variable names from defined file', function() {
    expect(this.jsonData.variables[0].name).to.eql('color-red');
    expect(this.jsonData.variables[1].name).to.eql('color-green');
    expect(this.jsonData.variables[2].name).to.eql('color-blue');
  });

  it('should contain all style variable values from defined file', function() {
    expect(this.jsonData.variables[0].value).to.eql('#ff0000');
    expect(this.jsonData.variables[1].value).to.eql('#00ff00');
    expect(this.jsonData.variables[2].value).to.eql('#0000ff');
  });

  it('should not reveal outputPath', function() {
    expect(this.jsonData.config.outputPath).to.not.exist;
  });

  it('should have all the modifiers', function() {
    expect(this.jsonData.sections[1].modifiers.length).to.eql(4);
  });

  // Markup

  it('should print markup if defined', function() {
    expect(this.jsonData.sections[0].markup).to.not.be.empty;
  });

  it('should not print empty markup', function() {
    expect(this.jsonData.sections[2].markup).to.not.exist;
  });

  // Related CSS

  it('should not print empty CSS', function() {
    expect(this.jsonData.sections[1].css).to.not.exist;
  });

  it('should have section CSS', function() {
    expect(this.jsonData.sections[2].css).to.eql('.test-css {color: purple;}');
  });

  // Related variables

  it('should contain all related variables', function() {
    var relatedVariables = ['color-red', 'color-green', 'color-blue'];
    expect(this.jsonData.sections[3].variables).to.eql(relatedVariables);
  });

  it('should parse related variables also from modifiers', function() {
    var relatedVariables = ['color-red', 'color-green', 'color-blue'];
    expect(this.jsonData.sections[1].variables).to.eql(relatedVariables);
  });

  it('should not add variables if section does not contain related variables', function() {
    expect(this.jsonData.sections[2].variables).to.eql([]);
  });
}

describe('styleguide.css', function() {
  beforeEach(function(done) {
    var files = [],
      _this = this;

    styleguideApplyStylesStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        _this.styleguideFile = findFile(files, 'styleguide.css');
        callback();
        done();
      })
    );
  });

  it('should exist', function() {
    expect(this.styleguideFile).to.be.an('object');
  });

  it('should include css from the all specified sources', function() {
    expect(this.styleguideFile.contents.toString()).to.contain('.test-style {\n  position: absolute;');
    expect(this.styleguideFile.contents.toString()).to.contain('.test-style2 {\n  position: absolute;');
  });
});

describe('styleguide.json for SCSS project', function() {

  var source = 'test/projects/scss-project/source/**/*.scss',
      variablesFile = 'test/projects/scss-project/source/styles/_styleguide_variables.scss';

  beforeEach(function(done) {
    createStyleGuideJson(source, variablesFile, this, done);
  });

  testVariablesFilePaths(variablesFile);
  sharedStyleguideJSON();
});

describe('styleguide.json for LESS project', function() {

  var source = 'test/projects/less-project/source/**/*.less',
      variablesFile = 'test/projects/less-project/source/styles/_styleguide_variables.less';

  beforeEach(function(done) {
    createStyleGuideJson(source, variablesFile, this, done);
  });

  testVariablesFilePaths(variablesFile);
  sharedStyleguideJSON();
});

function createStyleGuideJson(source, variablesFile, _this, done) {
  var files = [],
    config = defaultConfig;

  config.styleVariables = variablesFile;
  styleguideGenerateStream(source, config).pipe(
    through.obj({objectMode: true}, collector(files), function(callback) {
      _this.jsonData = JSON.parse(findFile(files, 'styleguide.json').contents);
      callback();
      done();
    })
  );
}

function testVariablesFilePaths(variablesFile) {

  it('should contain variable source file base names', function() {
    var base = path.basename(variablesFile);
    expect(this.jsonData.variables[0].file).to.eql(base);
    expect(this.jsonData.variables[1].file).to.eql(base);
    expect(this.jsonData.variables[2].file).to.eql(base);
  });

  it('should contain hex-encoded hash of source file paths', function() {
    var hex = /[a-h0-9]/;
    expect(this.jsonData.variables[0].fileHash).to.match(hex);
    expect(this.jsonData.variables[1].fileHash).to.match(hex);
    expect(this.jsonData.variables[2].fileHash).to.match(hex);
  });

}
