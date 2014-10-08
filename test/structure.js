var chai = require('chai'),
    runSequence = require('run-sequence');

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

var styleguide = require("../lib/styleguide.js");

var gulp = require('gulp');
gulp.task("testStyleguide", function(done, cb) {
  return gulp.src(["./demo/source/**/*.scss"])
    .pipe(styleguide({
        outputPath: "./demo/tmp",
        overviewPath: "./demo/source/overview.md",
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

  it('test', function(done) {
    runSequence("testStyleguide", function() {
      done()
    });
  })

})

