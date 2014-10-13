var gulp = require('gulp'),
  chai = require('chai'),
  styleguide = require('../lib/styleguide.js'),
  through = require('through2'),
  data = {
    source: {
      css: ['./test/project/source/**/*.scss'],
      overview: './test/project/source/overview.md'
    },
    output: './test/project/output'
  };

chai.config.includeStack = true;
chai.should();

function styleguideStream() {
  return gulp.src(data.source.css)
    .pipe(styleguide({
      title: 'Test Styleguide',
      outputPath: data.output,
      overviewPath: data.source.overview,
      extraHead: [
        '<link rel="stylesheet" type="text/css" href="your/custom/style.css">',
        '<script src="your/custom/script.js"></script>'
      ],
      sass: {
        // Options passed to gulp-ruby-sass
      }
    }))
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

  it('should contain outputPath', function() {
    jsonData.config.outputPath.should.eql(data.output);
  });
});
