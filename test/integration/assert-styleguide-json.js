var path = require('path'),
    expect = require('chai').expect,
    config = require('./test-config');

module.exports = (function() {

  var json, variablesFile;

  return {
    setJson: function(obj) {
      if (obj.contents) {
        json = JSON.parse(obj.contents);
      } else {
        json = obj;
      }
    },
    setVariablesFile: function(file) {
      variablesFile = file;
    },
    register: function() {
      it('should exist', function() {
        expect(json).to.be.an('object');
      });

      it('should contain correct title', function() {
        expect(json.config.title).to.eql('Test Styleguide');
      });

      it('should contain correct appRoot', function() {
        expect(json.config.appRoot).to.eql('/my-styleguide-book');
      });

      it('should contain extra heads in correct format', function() {
        expect(json.config.extraHead).to.eql(config.extraHead[0] + '\n' + config.extraHead[1]);
      });

      it('should contain all common classes', function() {
        expect(json.config.commonClass).to.eql(['custom-class-1', 'custom-class-2']);
      });

      it('should contain all style variable names from defined json', function() {
        expect(json.variables[0].name).to.eql('color-red');
        expect(json.variables[1].name).to.eql('color-green');
        expect(json.variables[2].name).to.eql('color-blue');
      });

      it('should contain all style variable values from defined json', function() {
        expect(json.variables[0].value).to.eql('#ff0000');
        expect(json.variables[1].value).to.eql('#00ff00');
        expect(json.variables[2].value).to.eql('#0000ff');
      });

      it('should not reveal outputPath', function() {
        expect(json.config.outputPath).to.not.exist;
      });

      it('should have all the modifiers', function() {
        expect(json.sections[1].modifiers.length).to.eql(4);
      });

      // Markup

      it('should print markup if defined', function() {
        expect(json.sections[0].markup).to.not.be.empty;
      });

      it('should not print empty markup', function() {
        expect(json.sections[2].markup).to.not.exist;
      });

      // Related CSS

      it('should not print empty CSS', function() {
        expect(json.sections[1].css).to.not.exist;
      });

      it('should have section CSS', function() {
        expect(json.sections[2].css).to.eql('.test-css {color: purple;}');
      });

      // Related variables

      it('should contain all related variables', function() {
        var relatedVariables = ['color-red', 'color-green', 'color-blue'];
        expect(json.sections[3].variables).to.eql(relatedVariables);
      });

      it('should parse related variables also from modifiers', function() {
        var relatedVariables = ['color-red', 'color-green', 'color-blue'];
        expect(json.sections[1].variables).to.eql(relatedVariables);
      });

      it('should not add variables if section does not contain related variables', function() {
        expect(json.sections[2].variables).to.eql([]);
      });

      it('should contain variable source file base names', function() {
        var base = path.basename(variablesFile);
        expect(json.variables[0].file).to.eql(base);
        expect(json.variables[1].file).to.eql(base);
        expect(json.variables[2].file).to.eql(base);
      });

      it('should contain hex-encoded hash of source file paths', function() {
        var hex = /[a-h0-9]/;
        expect(json.variables[0].fileHash).to.match(hex);
        expect(json.variables[1].fileHash).to.match(hex);
        expect(json.variables[2].fileHash).to.match(hex);
      });

    }
  };

}());
