var chai = require('chai'),
  runSequence = require('run-sequence'),
  execSync = require('exec-sync'),
  styleguide = require("../lib/styleguide.js"),

  data = {
    source: {
      css: ["./demo/source/**/*.scss"],
      overview: './demo/source/overview.md'
    },
    output: './test/demo/output'
  };


chai.use(require('chai-fs'));

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

var gulp = require('gulp');
gulp.task("testStyleguide", function(done, cb) {
  return gulp.src(data.source.css)
    .pipe(styleguide({
        outputPath: data.output,
        overviewPath: data.source.overview,
        extraHead: [
            "<link rel=\"stylesheet\" type=\"text/css\" href=\"your/custom/style.css\">",
            "<script src=\"your/custom/script.js\"></script>"
        ],
        sass: {
            // Options passed to gulp-ruby-sass
        },
      }))
});

describe('structure', function() {

  before(function(){
    // clean up
    execSync("rm -r " + data.output);
  });

  it('test', function(done) {
    runSequence("testStyleguide", function() {
      assert.pathExists(data.output, 'The output was built');
      done();
    });
  });

})

