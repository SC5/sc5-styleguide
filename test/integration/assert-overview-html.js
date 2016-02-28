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

      it('should have valid headers with sg class', function() {
        expect(file.contents.toString()).to.contain('<h1 class="sg" name="title1">Title1</h1>');
        expect(file.contents.toString()).to.contain('<h2 class="sg" name="title2">Title2</h2>');
      });

      it('should have valid paragraph with sg class', function() {
        expect(file.contents.toString()).to.contain('<p class="sg">Ut turkish, wings, sit to go barista half');
      });

      it('should escape code snippets', function() {
        expect(file.contents.toString()).to.contain('<div hljs="">&lt;div class=&quot;foobar&gt;Test code snippet&lt;/div&gt;\n</div>');
      });

      it('should have valid links with sg class', function() {
        expect(file.contents.toString()).to.contain('<a href="http://example.com" class="sg">Example link</a>');
      });
    }
  };

}());
