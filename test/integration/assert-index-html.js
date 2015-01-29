var expect = require('chai').expect;

module.exports = (function() {

  var indexHtml;

  return {
    set: function(file) {
      indexHtml = file;
    },
    register: function() {
      it('should exist', function() {
        expect(indexHtml).to.be.an('object');
      });

      it('should contain correct title', function() {
        expect(indexHtml.contents.toString()).to.contain('>Test Styleguide</title>');
      });

      it('should contain CSS style passed as parameter', function() {
        expect(indexHtml.contents.toString()).to.contain('<link rel="stylesheet" type="text/css" href="your/custom/style.css">');
      });

      it('should contain JS file passed as parameter', function() {
        expect(indexHtml.contents.toString()).to.contain('<script src="your/custom/script.js"></script>');
      });

      it('should define application root', function() {
        expect(indexHtml.contents.toString()).to.contain('<base href="/my-styleguide-book/" />');
      });
    }
  };

}());
