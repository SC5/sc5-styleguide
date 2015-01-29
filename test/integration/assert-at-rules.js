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

      it('should contain at rules', function() {
        expect(file.contents.toString()).to.contain('@keyframes myanimation {');
      });

      it('should not contain content from sourcemaps file', function() {
        expect(file.contents.toString()).not.to.contain('{{test.map content}}');
      });
    }
  };

}());
