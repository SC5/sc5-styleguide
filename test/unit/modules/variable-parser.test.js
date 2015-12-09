import { expect } from 'chai';
import parser from '~/lib/modules/variable-parser';

describe('Variable Parser', () => {

  var options = {
    parsers: {
      sass: 'sass',
      scss: 'scss',
      less: 'less',
      postcss: 'postcss'
    }
  };

  it('should not fail on empty files', (done) => {
    var files = {
      'empty.css': ''
    };
    parser.parseVariableDeclarationsFromFiles(files, options).then((variables) => {
      expect(variables).to.eql([]);
    }).then(done).catch(done);
  });

  it('should handle plain CSS files', (done) => {
    var files = {
      'aaa.css': `.test {}`
    };
    parser.parseVariableDeclarationsFromFiles(files, options).then((variables) => {
      expect(variables).to.eql([]);
    }).then(done).catch(done);
  });

  it('should handle unknown file types', (done) => {
    var files = {
      'aaa.foobar': `.test {}`
    };
    parser.parseVariableDeclarationsFromFiles(files, options).then((variables) => {
      expect(variables).to.eql([]);
    }).then(done).catch(done);
  });

  it('should detect file format from extension', (done) => {
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
    parser.parseVariableDeclarationsFromFiles(files, options).then((variables) => {
      expect(variables.length).to.eql(4);
    }).then(done).catch(done);
  });

  describe('finding variable declarations from multiple files', () => {
    var files;

    beforeEach(() => {
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

    it('should sort variables by filename', (done) => {
      parser.parseVariableDeclarationsFromFiles(files, options).then((variables) => {
        expect(variables[0].file).to.eql('aaa.scss');
        expect(variables[1].file).to.eql('aaa.scss');
        expect(variables[2].file).to.eql('aaa.scss');
        expect(variables[3].file).to.eql('bbb.scss');
        expect(variables[4].file).to.eql('ccc.scss');
        expect(variables[5].file).to.eql('ccc.scss');
      }).then(done).catch(done);
    });

    it('should not sort variables inside a single file', (done) => {
      parser.parseVariableDeclarationsFromFiles(files, options).then((variables) => {
        expect(variables[0].name).to.eql('var2');
        expect(variables[1].name).to.eql('var1');
        expect(variables[2].name).to.eql('same');
      }).then(done).catch(done);
    });

    it('should allow same variable name inside multiple files', (done) => {
      parser.parseVariableDeclarationsFromFiles(files, options).then((variables) => {
        expect(variables[2].name).to.eql('same');
        expect(variables[5].name).to.eql('same');
      }).then(done).catch(done);
    });

    it('should add hex encoded hash of file path to each variable', (done) => {
      var hex = /[a-h0-9]/;
      parser.parseVariableDeclarationsFromFiles(files, options).then((variables) => {
        variables.forEach((variable) => {
          expect(variable.fileHash).to.match(hex);
        });
      }).then(done).catch(done);
    });

  });

  describe('modifier variable finding', () => {
    it('should detect SCSS variables correctly', () => {
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

    it('should detect LESS variables correctly', () => {
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

    it('should return empty array when no variables are found', () => {
      var input = [
        {
          name: '.modifier'
        }
      ];
      expect(parser.findModifierVariables(input)).to.eql([]);
    });

    it('should return empty array with undefined input', () => {
      expect(parser.findModifierVariables()).to.eql([]);
    });

  });

});
