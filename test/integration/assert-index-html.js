var expect = require('chai').expect,
    config = require('./test-config');

module.exports = (function() {

  var file, contents;

  return {
    set: function(fileObj) {
      file = fileObj;
      contents = file.contents.toString();
    },
    register: function() {
      it('should exist', function() {
        expect(file).to.be.an('object');
      });

      it('should contain correct title', function() {
        expect(contents).to.contain('>Test Styleguide</title>');
      });

      it('should contain CSS style passed as parameter', function() {
        expect(contents).to.contain('<link rel="stylesheet" type="text/css" href="your/custom/style.css">');
      });

      it('should contain JS file passed as parameter', function() {
        expect(contents).to.contain('<script src="your/custom/script.js"></script>');
      });

      it('should define application root', function() {
        expect(contents).to.contain('<base href="' + config.appRoot + '/" />');
      });

      describe('angular template userStyles.html', function() {

        it('should be defined', function() {
          expect(contents).to.contain('<script type="text/ng-template" id="userStyles.html">');
        });

        describe('style imports', function() {

          var style,
              expected = ['styleguide.css', 'styleguide_pseudo_styles.css', 'styleguide_helper_elements.css'];

          before(function() {
            var start = '<script type="text/ng-template" id="userStyles.html">',
                s = '<style>',
                startIdx = contents.indexOf(start),
                idx = contents.indexOf(s, startIdx);
            style = contents.substring(idx + s.length, contents.indexOf('</style>', idx));
          });

          expected.forEach(function(css) {

            it('should contain ' + css + ' with appRoot', function() {
              expect(style).to.contain('@import url(\'' + config.appRoot + '/' + css + '\');');
            });

          });

        });

      });

    }
  };

}());
