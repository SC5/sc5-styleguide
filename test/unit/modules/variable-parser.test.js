var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    parser = requireModule('variable-parser');

describe('ignore block removal', function() {
  it('should remove definitions between tags and leave other lines intact', function() {
    var str = multiline(function() {
    /*
First line
styleguide:ignore:start
Ignore 1
Ignore 2
styleguide:ignore:end
Last line
    */
    });
    expect(parser.removeIgnoredBlocks(str)).to.eql('First line\nLast line');
  });

  it('should remove everything on the same line as tags', function() {
    var str = multiline(function() {
    /*
First line
// styleguide:ignore:start something
Ignore 1
Ignore 2
// styleguide:ignore:end something
Last line
    */
    });
    expect(parser.removeIgnoredBlocks(str)).to.eql('First line\nLast line');
  });

  it('should support multiple blocks', function() {
    var str = multiline(function() {
    /*
First line
styleguide:ignore:start
Ignore 1
styleguide:ignore:end
Middle line
styleguide:ignore:start
Ignore 1
styleguide:ignore:end
Last line
    */
    });
    expect(parser.removeIgnoredBlocks(str)).to.eql('First line\nMiddle line\nLast line');
  });

  it('should remove everything after start tag even if it is not closed', function() {
    var str = multiline(function() {
    /*
First line
styleguide:ignore:start
Ignore 1
Ignore 2
Ignore 3
    */
    });
    expect(parser.removeIgnoredBlocks(str)).to.eql('First line');
  });
});

describe('Variable Parser', function() {

  it('should handle plain CSS files', function(done) {
    var files = {
      'aaa.css': multiline(function() {
        /*
        .test {}
        */
      })
    };
    parser.parseVariableDeclarationsFromFiles(files).then(function(variables) {
      expect(variables).to.eql([]);
    }).then(done).catch(done);
  });

  it('should handle unknown file types', function(done) {
    var files = {
      'aaa.foobar': multiline(function() {
        /*
        .test {}
        */
      })
    };
    parser.parseVariableDeclarationsFromFiles(files).then(function(variables) {
      expect(variables).to.eql([]);
    }).then(done).catch(done);
  });

  describe('finding variable declarations from multiple files', function() {
    var files;

    beforeEach(function() {
      files = {
        'ccc.scss': multiline(function() {
          /*
          $var4: value1;
          $same: file3;
          */
        }),
        'aaa.scss': multiline(function() {
          /*
          $var2: value2;
          $var1: value1;
          $same: file1;
          */
        }),
        'bbb.scss': multiline(function() {
          /*
          $var3: value3;
          */
        })
      };
    });

    it('should sort variables by filename', function(done) {
      parser.parseVariableDeclarationsFromFiles(files).then(function(variables) {
        expect(variables[0].file).to.eql('aaa.scss');
        expect(variables[1].file).to.eql('aaa.scss');
        expect(variables[2].file).to.eql('aaa.scss');
        expect(variables[3].file).to.eql('bbb.scss');
        expect(variables[4].file).to.eql('ccc.scss');
        expect(variables[5].file).to.eql('ccc.scss');
      }).then(done).catch(done);
    });

    it('should not sort variables inside a single file', function(done) {
      parser.parseVariableDeclarationsFromFiles(files).then(function(variables) {
        expect(variables[0].name).to.eql('var2');
        expect(variables[1].name).to.eql('var1');
        expect(variables[2].name).to.eql('same');
      }).then(done).catch(done);
    });

    it('should allow same variable name inside multiple files', function(done) {
      parser.parseVariableDeclarationsFromFiles(files).then(function(variables) {
        expect(variables[2].name).to.eql('same');
        expect(variables[5].name).to.eql('same');
      }).then(done).catch(done);
    });

    it('should add hex encoded hash of file path to each variable', function(done) {
      var hex = /[a-h0-9]/;
      parser.parseVariableDeclarationsFromFiles(files).then(function(variables) {
        variables.forEach(function(variable) {
          expect(variable.fileHash).to.match(hex);
        });
      }).then(done).catch(done);
    });

  });

  describe('variable finding', function() {

    describe('SCSS syntax', function() {

      it('should return all used variables', function() {
        var str = multiline(function() {
          /*
          color: $mycolor1;
          .testStyle {
            border: 1px solid $mycolor2;
          }
          .testStyle2 {
            background-color: $mycolor3;
          }
          */
        }),
        result = ['mycolor1', 'mycolor2', 'mycolor3'];
        expect(parser.findVariables(str)).eql(result);
      });

      it('should not return new variable definitions', function() {
        var str = multiline(function() {
          /*
          $mycolor: #00ff00;
          .testStyle {
            color: $mycolor2;
          }
          */
        }),
        result = ['mycolor2'];
        expect(parser.findVariables(str)).eql(result);
      });

      it('should find variables that are used as function arguments', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            color: rgba($mycolor, $myopacity);
          }
          */
        }),
        result = ['mycolor', 'myopacity'];
        expect(parser.findVariables(str)).eql(result);
      });

      it('should not find variables from variable declarations', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            $sum1: $var1 + $var2;
            padding: $sum2;
          }
          */
        }),
        result = ['sum2'];
        expect(parser.findVariables(str)).eql(result);
      });

      it('should find variables that have double parenthesis', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            padding: ceil(($myvar));
          }
          */
        }),
        result = ['myvar'];
        expect(parser.findVariables(str)).eql(result);
      });
    });

    describe('LESS syntax', function() {

      it('should return all used variables', function() {
        var str = multiline(function() {
          /*
          color: @mycolor1;
          .testStyle {
            border: 1px solid @mycolor2;
          }
          .testStyle2 {
            background-color: @mycolor3;
          }
          */
        }),
        result = ['mycolor1', 'mycolor2', 'mycolor3'];
        expect(parser.findVariables(str, 'less')).eql(result);
      });

      it('should not return new variable definitions', function() {
        var str = multiline(function() {
          /*
          @mycolor: #00ff00;
          .testStyle {
            color: @mycolor2;
          }
          */
        }),
        result = ['mycolor2'];
        expect(parser.findVariables(str, 'less')).eql(result);
      });

      it('should find variables that are used as function arguments', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            color: rgba(@mycolor, @myopacity);
          }
          */
        }),
        result = ['mycolor', 'myopacity'];
        expect(parser.findVariables(str, 'less')).eql(result);
      });

      it('should not find variables from variable declarations', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            @sum: @var1 + @var2;
            padding: @sum;
          }
          */
        }),
        result = ['sum'];
        expect(parser.findVariables(str, 'less')).eql(result);
      });

    });

  });

  describe('variable parser', function() {

    describe('SCSS syntax', function() {

      it('should parse basic variables', function() {
        var str = multiline(function() {
          /*
          $mycolor: #00ff00;
          $mypadding: 3px;
          $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        result = [
          {name: 'mycolor', value: '#00ff00'},
          {name: 'mypadding', value: '3px'},
          {name: 'myfont', value: '"Helvetica Neue", Helvetica, Arial, sans-serif'}
        ];
        expect(parser.parseVariableDeclarations(str)).eql(result);
      });

      it('should not detect variables that are only used not declarared', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            color: $myvar;
          }
          */
        });
        expect(parser.parseVariableDeclarations(str)).eql([]);
      });

      it('should not return variables that are used as function arguments', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            color: rgba($mycolor, $myopacity);
          }
          */
        });
        expect(parser.parseVariableDeclarations(str)).eql([]);
      });

      it('should handle cases when variable value is another variable', function() {
        var str = multiline(function() {
          /*
          $var1: $another;
          */
        }),
        result = [{
          name: 'var1',
          value: '$another'
        }];
        expect(parser.parseVariableDeclarations(str)).eql(result);
      });

      it('should parse variables from file with containing comments and intended lines', function() {
        var str = multiline(function() {
          /*
          $mycolor: #00ff00;
          // Test comment
          $mypadding: 3px; // Test comment 2
          $myfont: "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        result = [
          {name: 'mycolor', value: '#00ff00'},
          {name: 'mypadding', value: '3px'},
          {name: 'myfont', value: '"Helvetica Neue", Helvetica, Arial, sans-serif'}
        ];
        expect(parser.parseVariableDeclarations(str)).eql(result);
      });

      it('should parse variables correct when there are multiple variables in a single line', function() {
        var str = '$color1: #ff0000; $color2: #00ff00; $color3: #0000ff;',
          result = [
            {name: 'color1', value: '#ff0000'},
            {name: 'color2', value: '#00ff00'},
            {name: 'color3', value: '#0000ff'}
          ];
        expect(parser.parseVariableDeclarations(str)).eql(result);
      });

      it('should not take commented variables', function() {
        var str = multiline(function() {
          /*
          $color1: #ff0000;
          // $color2: #00ff00;
          $color3: #0000ff;
          // $color4: #0f0f0f;
          */
        }),
        result = [
          {name: 'color1', value: '#ff0000'},
          {name: 'color3', value: '#0000ff'}
        ];
        expect(parser.parseVariableDeclarations(str)).eql(result);
      });

      it('should not detect @import as variable', function() {
        var str = multiline(function() {
          /*
          @import 'file';
          */
        }),
        result = [];
        expect(parser.parseVariableDeclarations(str)).eql(result);
      });

    });

    describe('LESS syntax', function() {

      it('should parse basic variables', function() {
        var str = multiline(function() {
          /*
          @mycolor: #00ff00;
          @mypadding: 3px;
          @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        result = [
          {name: 'mycolor', value: '#00ff00'},
          {name: 'mypadding', value: '3px'},
          {name: 'myfont', value: '"Helvetica Neue", Helvetica, Arial, sans-serif'}
        ];
        expect(parser.parseVariableDeclarations(str, 'less')).eql(result);
      });

      it('should not detect variables that are only used not declarared', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            color: @myvar;
          }
          */
        });
        expect(parser.parseVariableDeclarations(str)).eql([]);
      });

      it('should not return variables that are used as function arguments', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            color: rgba(@mycolor, @myopacity);
          }
          */
        });
        expect(parser.parseVariableDeclarations(str, 'less')).eql([]);
      });

      it('should handle cases when variable value is another variable', function() {
        var str = multiline(function() {
          /*
          @var1: @another;
          */
        }),
        result = [{
          name: 'var1',
          value: '@another'
        }];
        expect(parser.parseVariableDeclarations(str, 'less')).eql(result);
      });

      it('should parse variables from file with containing comments and intended lines', function() {
        var str = multiline(function() {
          /*
          @mycolor: #00ff00;
          // Test comment
            @mypadding: 3px; // Test comment 2
          @myfont: "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        result = [
          {name: 'mycolor', value: '#00ff00'},
          {name: 'mypadding', value: '3px'},
          {name: 'myfont', value: '"Helvetica Neue", Helvetica, Arial, sans-serif'}
        ];
        expect(parser.parseVariableDeclarations(str, 'less')).eql(result);
      });

      it('should parse variables correct when there are multiple variables in a single line', function() {
        var str = '@color1: #ff0000; @color2: #00ff00; @color3: #0000ff;',
          result = [
            {name: 'color1', value: '#ff0000'},
            {name: 'color2', value: '#00ff00'},
            {name: 'color3', value: '#0000ff'}
          ];
        expect(parser.parseVariableDeclarations(str, 'less')).eql(result);
      });

      it('should not take commented variables', function() {
        var str = multiline(function() {
          /*
          @color1: #ff0000;
          // @color2: #00ff00;
          @color3: #0000ff;
          // @color4: #0f0f0f;
          */
        }),
        result = [
          {name: 'color1', value: '#ff0000'},
          {name: 'color3', value: '#0000ff'}
        ];
        expect(parser.parseVariableDeclarations(str, 'less')).eql(result);
      });

      it('should not detect @import as a variable', function() {
        var str = multiline(function() {
          /*
          @import 'file';
          */
        }),
        result = [];
        expect(parser.parseVariableDeclarations(str, 'less')).eql(result);
      });

      it('should accept variables named @import', function() {
        var str = multiline(function() {
          /*
          @import: 3px;
          */
        }),
        result = [
          {name: 'import', value: '3px'}
        ];
        expect(parser.parseVariableDeclarations(str, 'less')).eql(result);
      });

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
