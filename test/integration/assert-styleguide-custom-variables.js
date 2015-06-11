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

      it('should custom colors definition', function() {
        expect(file.contents.toString()).to.contain('$primary_color: #00FF00;');
      });
    }
  };

}());
