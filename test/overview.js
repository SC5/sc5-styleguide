var gulp = require('gulp'),
  chai = require('chai'),
  styleguide = require('../lib/styleguide.js'),
  fs = require('fs'),
  through = require('through2'),
  data = {
    source: {
      css: ['./demo/source/**/*.scss'],
      overview: './demo/source/overview.md'
    },
    output: './test/demo/output'
  };

chai.config.includeStack = true;
chai.should();

function styleguideStream() {
  return gulp.src(data.source.css)
    .pipe(styleguide({
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

describe('overview.md', function() {
  var overviewHtml,
    overviewMd;
  this.timeout(5000);

  before(function(done) {
    var files = [];

    overviewMd = fs.readFileSync(data.source.overview, 'utf-8');

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

  it('should have content', function() {

    // Checking headers
    var headers = overviewMd.match(/^#(.+)/gm);
    headers.forEach(function(h) {
      var header = h.substr(h.lastIndexOf('#') + 1).trim();
      overviewHtml.contents.toString().should.contain('>' + header + '</h');
    });
  });

})
