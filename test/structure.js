var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  runSequence = require('run-sequence'),
  execSync = require('exec-sync'),
  styleguide = require('../lib/styleguide.js'),
  through = require('through2'),
  defaultConfig = {},
  defaultSource;

chai.config.includeStack = true;

beforeEach(function() {
  defaultSource = './test/projects/scss-project/source/**/*.scss',
  defaultConfig = {
    title: 'Test Styleguide',
    overviewPath: './test/projects/scss-project/source/test_overview.md',
    appRoot: '/my-styleguide-book',
    extraHead: [
      '<link rel="stylesheet" type="text/css" href="your/custom/style.css">',
      '<script src="your/custom/script.js"></script>'
    ],
    commonClass: ['custom-class-1', 'custom-class-2'],
    styleVariables: './test/projects/scss-project/source/styles/_styleguide_variables.scss',
    sass: {
      // Options passed to gulp-ruby-sass
    },
    filesConfig: []
  };
});

function styleguideStream(source, config) {
  return gulp.src(source || defaultSource)
    .pipe(styleguide(defaultConfig))
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
  };
  return;
}

describe('index.html', function() {
  var indexHtml;
  this.timeout(5000);

  before(function(done) {
    var files = [];
    styleguideStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        indexHtml = findFile(files, 'index.html');
        done();
      })
    );
  });

  it('should exist', function() {
    expect(indexHtml).to.be.an('object');
  });

  it('should contain correct title', function() {
    expect(indexHtml.contents.toString()).to.contain('>Test Styleguide</title>');
  });

  it('should contain CSS style passed as parameter', function() {
    expect(indexHtml.contents.toString()).to.contain('<link rel="stylesheet" type="text/css" href="your/custom/style.css">');
  });

  it('should contain JS file passed as parameter', function() {
    expect(indexHtml.contents.toString()).to.contain('<script src="your/custom/script.js"></script>');
  });

  it('should contain filesConfig passed as parameter and in correct format', function() {
    expect(indexHtml.contents.toString()).to.contain('var filesConfig = []');
  });

  it('should define application root', function() {
    expect(indexHtml.contents.toString()).to.contain('<base href="/my-styleguide-book/" />')
  });
});

describe('styleguide_pseudo_styles.css', function() {
  var styleguideFile;
  this.timeout(5000);

  before(function(done) {
    var files = [];
    styleguideStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        styleguideFile = findFile(files, 'styleguide_pseudo_styles.css');
        done();
      })
    );
  });

  it('should exist', function() {
    expect(styleguideFile).to.be.an('object');
  });
});

describe('overview.html', function() {
  var overviewHtml;
  this.timeout(5000);

  before(function(done) {
    var files = [];

    styleguideStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        overviewHtml = findFile(files, 'overview.html');
        done();
      })
    );
  });

  it('should exist', function() {
    expect(overviewHtml).to.be.an('object');
  });

  it('should have valid headers with sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<h1 class="sg">Title1</h1>');
    expect(overviewHtml.contents.toString()).to.contain('<h2 class="sg">Title2</h2>');
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

  it('should have valid headers with sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<h1 class="sg">Title1</h1>');
    expect(overviewHtml.contents.toString()).to.contain('<h2 class="sg">Title2</h2>');
  });
});

['SCSS', 'LESS'].forEach(function(type) {
  var source,
    config;

  beforeEach(function() {
    config = defaultConfig;
    if (type === 'SCSS') {
      config.styleVariables = './test/projects/scss-project/source/styles/_styleguide_variables.scss';
      source = './test/projects/scss-project/source/**/*.scss'
    } else if (type === 'LESS') {
      config.styleVariables = './test/projects/less-project/source/styles/_styleguide_variables.less';
      source = './test/projects/less-project/source/**/*.less'
    }
  });

  describe('styleguide.css for ' + type + ' project', function() {
    var styleguideFile;
    this.timeout(5000);

    before(function(done) {
      var files = [];
      styleguideStream().pipe(
        through.obj({objectMode: true}, collector(files), function(callback) {
          styleguideFile = findFile(files, 'styleguide.css');
          done();
        })
      );
    });

    it('should exist', function() {
      expect(styleguideFile).to.be.an('object');
    });

    it('should be processed correctly', function() {
      expect(styleguideFile.contents.toString()).to.contain('.section {\n  color: #ff0000; }');
    });
  });

  describe('styleguide.json for ' + type + ' project', function() {
    var jsonData;
    this.timeout(5000);

    before(function(done) {
      var files = [];

      styleguideStream(source).pipe(
        through.obj({objectMode: true}, collector(files), function(callback) {
          if (jsonData = findFile(files, 'styleguide.json')) {
            jsonData = JSON.parse(jsonData.contents);
          }
          done();
        })
      );
    });

    it('should exist', function() {
      expect(jsonData).to.be.an('object');
    });

    it('should contain correct title', function() {
      expect(jsonData.config.title).to.eql('Test Styleguide');
    });

    it('should contain correct appRoot', function() {
      expect(jsonData.config.appRoot).to.eql('/my-styleguide-book');
    });

    it('should contain extra heads in correct format', function() {
      expect(jsonData.config.extraHead).to.eql(defaultConfig.extraHead[0] + '\n' + defaultConfig.extraHead[1]);
    });

    it('should contain all common classes', function() {
      expect(jsonData.config.commonClass).to.eql(['custom-class-1', 'custom-class-2']);
    });

    it('should contain all ' + type + ' variables from defined file', function() {
      var sassData = {
        'color-red': { value: '#ff0000', index: 0 },
        'color-green': { value: '#00ff00', index: 1 },
        'color-blue': { value: '#0000ff', index: 2 }
      };
      expect(jsonData.config.settings).to.eql(sassData);
    });

    it('should not reveal outputPath', function() {
      expect(jsonData.config.outputPath).to.not.exist;
    });

    it('should print markup if defined', function() {
      expect(jsonData.sections[0].markup).to.not.be.empty;
    });

    it('should not print empty markup', function() {
      expect(jsonData.sections[2].markup).to.not.exist;
    });

    it('should have all the modifiers', function() {
      expect(jsonData.sections[1].modifiers.length).to.eql(3)
    });

    it('should have section CSS', function() {
      expect(jsonData.sections[2].css).to.eql('.test-css {color: purple;}');
    });

    it('should not print empty markup', function() {
      expect(jsonData.sections[1].css).to.not.exist;
    });
  });
});
