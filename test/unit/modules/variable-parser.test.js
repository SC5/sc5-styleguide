var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    parser = requireModule('variable-parser');

describe('Variable Parser', function() {

  var options = {
    parsers: {
      sass: 'sass',
      scss: 'scss',
      less: 'less',
      postcss: 'postcss'
    }
  };

  it('should not fail on empty files', function(done) {
    var files = {
      'empty.css': ''
    };
    parser.parseVariableDeclarationsFromFiles(files, options).then(function(variables) {
      expect(variables).to.eql([]);
    }).then(done).catch(done);
  });

  it('should handle plain CSS files', function(done) {
    var files = {
      'aaa.css': `.test {}`
    };
    parser.parseVariableDeclarationsFromFiles(files, options).then(function(variables) {
      expect(variables).to.eql([]);
    }).then(done).catch(done);
  });

  it('should handle unknown file types', function(done) {
    var files = {
      'aaa.foobar': `.test {}`
    };
    parser.parseVariableDeclarationsFromFiles(files, options).then(function(variables) {
      expect(variables).to.eql([]);
    }).then(done).catch(done);
  });

  it('should detect file format from extension', function(done) {
    var files = {
      'file.sass': `
        $color: red
        .foo
          color: $color;`,
      'file.scss': `
        $color: red
        .foo {
          color: $color;
        }`,
      'file.less': `
        @foo: red;
        .foo {
          color: @foo;
        }`,
      'file.postcss': `
        --color: red;
        .foo {
          color: var(--color);
        }`
    };
    parser.parseVariableDeclarationsFromFiles(files, options).then(function(variables) {
      expect(variables.length).to.eql(4);
    }).then(done).catch(done);
  });

  describe('finding variable declarations from multiple files', function() {
    var files;

    beforeEach(function() {
      files = {
        'ccc.scss': `
          $var4: value1;
          $same: file3;`,
        'aaa.scss': `
          $var2: value2;
          $var1: value1;
          $same: file1;`,
        'bbb.scss': `
          $var3: value3;`
      };
    });

    it('should sort variables by filename', function(done) {
      parser.parseVariableDeclarationsFromFiles(files, options).then(function(variables) {
        expect(variables[0].file).to.eql('aaa.scss');
        expect(variables[1].file).to.eql('aaa.scss');
        expect(variables[2].file).to.eql('aaa.scss');
        expect(variables[3].file).to.eql('bbb.scss');
        expect(variables[4].file).to.eql('ccc.scss');
        expect(variables[5].file).to.eql('ccc.scss');
      }).then(done).catch(done);
    });

    it('should not sort variables inside a single file', function(done) {
      parser.parseVariableDeclarationsFromFiles(files, options).then(function(variables) {
        expect(variables[0].name).to.eql('var2');
        expect(variables[1].name).to.eql('var1');
        expect(variables[2].name).to.eql('same');
      }).then(done).catch(done);
    });

    it('should allow same variable name inside multiple files', function(done) {
      parser.parseVariableDeclarationsFromFiles(files, options).then(function(variables) {
        expect(variables[2].name).to.eql('same');
        expect(variables[5].name).to.eql('same');
      }).then(done).catch(done);
    });

    it('should add hex encoded hash of file path to each variable', function(done) {
      var hex = /[a-h0-9]/;
      parser.parseVariableDeclarationsFromFiles(files, options).then(function(variables) {
        variables.forEach(function(variable) {
          expect(variable.fileHash).to.match(hex);
        });
      }).then(done).catch(done);
    });

  });

  describe('modifier variable finding', function() {
    it('should detect SCSS variables correctly', function() {
      var input = [
        {
          name: '$var1'
        },
        {
          name: '.modifier'
        },
        {
          name: '$var2'
        }
      ];
      expect(parser.findModifierVariables(input)).to.eql(['var1', 'var2']);
    });

    it('should detect LESS variables correctly', function() {
      var input = [
        {
          name: '@var1'
        },
        {
          name: '.modifier'
        },
        {
          name: '@var2'
        }
      ];
      expect(parser.findModifierVariables(input)).to.eql(['var1', 'var2']);
    });

    it('should return empty array when no variables are found', function() {
      var input = [
        {
          name: '.modifier'
        }
      ];
      expect(parser.findModifierVariables(input)).to.eql([]);
    });

    it('should return empty array with undefined input', function() {
      expect(parser.findModifierVariables()).to.eql([]);
    });

  });

});
