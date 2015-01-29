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

      it('should include css from the all specified sources', function() {
        expect(file.contents.toString()).to.contain('.test-style {\n  position: absolute;');
        expect(file.contents.toString()).to.contain('.test-style2 {\n  position: absolute;');
      });
    }
  };

}());
