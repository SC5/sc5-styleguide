var expect = require('chai').expect;

module.exports = (function() {

  var file;

  return {
    set: function(fileObj) {
      file = fileObj;
    },
    register: function() {
      it('should exist', function() {
        expect(file).to.be.an('object');
      });

      it('should contain pseudo classes converted to normal class names', function() {
        expect(file.contents.toString()).to.contain('.test-style.pseudo-class-hover {');
        expect(file.contents.toString()).to.contain('.test-style.pseudo-class-active {');
      });

      it('should not contain content from sourcemaps file', function() {
        expect(file.contents.toString()).not.to.contain('{{test.map content}}');
      });
    }
  };

}());
