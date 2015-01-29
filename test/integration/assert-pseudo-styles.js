var expect = require('chai').expect;

module.exports = (function() {

  var styleguideFile;

  return {
    set: function(file) {
      styleguideFile = file;
    },
    register: function() {
      it('should exist', function() {
        expect(styleguideFile).to.be.an('object');
      });

      it('should contain pseudo classes converted to normal class names', function() {
        expect(styleguideFile.contents.toString()).to.contain('.test-style.pseudo-class-hover {');
        expect(styleguideFile.contents.toString()).to.contain('.test-style.pseudo-class-active {');
      });

      it('should not contain content from sourcemaps file', function() {
        expect(styleguideFile.contents.toString()).not.to.contain('{{test.map content}}');
      });
    }
  };

}());
