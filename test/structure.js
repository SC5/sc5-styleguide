var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  runSequence = require('run-sequence'),
  execSync = require('exec-sync'),
  styleguide = require('../lib/styleguide.js'),
  through = require('through2'),
  defaultSource = './test/project/source/**/*.scss',
  defaultConfig = {
    title: 'Test Styleguide',
    overviewPath: './test/project/source/overview.md',
    appRoot: '/my-styleguide-book',
    extraHead: [
      '<link rel="stylesheet" type="text/css" href="your/custom/style.css">',
      '<script src="your/custom/script.js"></script>'
    ],
    commonClass: ['custom-class-1', 'custom-class-2'],
    sassVariables: './test/project/source/styles/_styleguide_variables.scss',
    sass: {
      // Options passed to gulp-ruby-sass
    },
    filesConfig: []
  };

chai.config.includeStack = true;
var should = chai.should();

function styleguideStream() {
  return gulp.src(defaultSource)
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
    indexHtml.should.be.an('object');
  });

  it('should contain correct title', function() {
    indexHtml.contents.toString().should.contain('<title>Test Styleguide</title>');
  });

  it('should contain CSS style passed as parameter', function() {
    indexHtml.contents.toString().should.contain('<link rel="stylesheet" type="text/css" href="your/custom/style.css">');
  });

  it('should contain JS file passed as parameter', function() {
    indexHtml.contents.toString().should.contain('<script src="your/custom/script.js"></script>');
  });

  it('should contain filesConfig passed as parameter and in correct format', function() {
    indexHtml.contents.toString().should.contain('var filesConfig = []');
  });

  it('should define application root', function() {
    indexHtml.contents.toString().should.contain('<base href="/my-styleguide-book/" />')
  });
});

describe('overview.md', function() {
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
    overviewHtml.should.be.an('object');
  });

  it('should have valid headers with sg class', function() {
    overviewHtml.contents.toString().should.contain('<h1 class="sg">Title1</h1>');
    overviewHtml.contents.toString().should.contain('<h2 class="sg">Title2</h2>');
  });

  it('should have valid paragraph with sg class', function() {
    overviewHtml.contents.toString().should.contain('<p class="sg">Ut turkish, wings, sit to go barista half');
  });

  it('should escape code snippets', function() {
    overviewHtml.contents.toString().should.contain('<pre class="sg"><code>&lt;div class=&quot;foobar&gt;Test code snippet&lt;/div&gt;\n</code></pre>');
  });

  it('should have valid headers with sg class', function() {
    overviewHtml.contents.toString().should.contain('<h1 class="sg">Title1</h1>');
    overviewHtml.contents.toString().should.contain('<h2 class="sg">Title2</h2>');
  });
});

describe('styleguide.json', function() {
  var jsonData;
  this.timeout(5000);

  before(function(done) {
    var files = [];
    styleguideStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        if (jsonData = findFile(files, 'styleguide.json')) {
          jsonData = JSON.parse(jsonData.contents);
        }
        done();
      })
    );
  });

  it('should exist', function() {
    jsonData.should.be.an('object');
  });

  it('should contain correct title', function() {
    jsonData.config.title.should.eql('Test Styleguide');
  });

  it('should contain correct appRoot', function() {
    jsonData.config.appRoot.should.eql('/my-styleguide-book');
  });

  it('should contain extra heads in correct format', function() {
    jsonData.config.extraHead.should.eql(defaultConfig.extraHead[0] + '\n' + defaultConfig.extraHead[1]);
  });

  it('should contain all common classes', function() {
    jsonData.config.commonClass.should.eql(['custom-class-1', 'custom-class-2']);
  });

  it('should contain all SASS variables from defined file', function() {
    var sassData = {
      'color-red': '#ff0000',
      'color-green': '#00ff00',
      'color-blue': '#0000ff'
    }
    jsonData.config.settings.should.eql(sassData);
  })

  it('should not reveal outputPath', function() {
    should.not.exist(jsonData.config.outputPath);
  });

  it('should print markup if defined', function() {
    jsonData.sections[1].markup.should.not.be.empty;
  });

  it('should not print empty markup', function() {
    should.not.exist(jsonData.sections[2].markup);
  });
});
