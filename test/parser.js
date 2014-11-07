var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  multiline = require('multiline'),
  parser = require('../lib/modules/parser');

describe('Parser', function() {
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
        result = {
          mycolor: { value: '#00ff00', index: 0 },
          mypadding: { value: '3px', index: 1 },
          myfont: { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', index: 2 }
        };
        expect(parser.parseVariables(str)).eql(result);
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
        result = {
          mycolor: { value: '#00ff00', index: 0 },
          mypadding: { value: '3px', index: 1 },
          myfont: { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', index: 2 }
        };
        expect(parser.parseVariables(str)).eql(result);
      });

      it('should parse variables correct when there are multiple variables in a single line', function() {
        var str = '$color1: #ff0000; $color2: #00ff00; $color3: #0000ff;',
            result = {
              color1: { value: '#ff0000', index: 0 },
              color2: { value: '#00ff00', index: 1 },
              color3: { value: '#0000ff', index: 2 }
            };
        expect(parser.parseVariables(str)).eql(result);
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
        result = {
          color1: { value: '#ff0000', index: 0 },
          color3: { value: '#0000ff', index: 1 }
        };
        expect(parser.parseVariables(str)).eql(result);
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
        result = {
          mycolor: { value: '#00ff00', index: 0 },
          mypadding: { value: '3px', index: 1 },
          myfont: { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', index: 2 }
        };
        expect(parser.parseVariables(str, 'less')).eql(result);
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
        result = {
          mycolor: { value: '#00ff00', index: 0 },
          mypadding: { value: '3px', index: 1 },
          myfont: { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', index: 2 }
        };
        expect(parser.parseVariables(str, 'less')).eql(result);
      });

      it('should parse variables correct when there are multiple variables in a single line', function() {
        var str = '@color1: #ff0000; @color2: #00ff00; @color3: #0000ff;',
            result = {
              color1: { value: '#ff0000', index: 0 },
              color2: { value: '#00ff00', index: 1 },
              color3: { value: '#0000ff', index: 2 }
            };
        expect(parser.parseVariables(str, 'less')).eql(result);
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
        result = {
          color1: { value: '#ff0000', index: 0 },
          color3: { value: '#0000ff', index: 1 }
        };

        expect(parser.parseVariables(str, 'less')).eql(result);
      });
    });
  });

  describe('variable setter', function() {
    describe('SCSS syntax', function() {
      it('should change single value variable', function() {
        var str = multiline(function() {
          /*
  $mycolor: #00ff00;
  $mypadding: 3px;
  $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        variables = {
          mycolor: '#0000ff',
          mypadding: '5px'
        },
        result = multiline(function() {
          /*
  $mycolor: #0000ff;
  $mypadding: 5px;
  $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        changed = parser.setVariables(str, 'scss', variables);
        expect(changed).eql(result);
      });

      it('should change complex value variable', function() {
        var str = multiline(function() {
          /*
  $mycolor: #00ff00;
  $mypadding: 3px;
  $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        variables = {
          myfont: '"Helvetica Neue", Tahoma'
        },
        result = multiline(function() {
          /*
  $mycolor: #00ff00;
  $mypadding: 3px;
  $myfont:   "Helvetica Neue", Tahoma;
          */
        }),
        changed = parser.setVariables(str, 'scss', variables);
        expect(changed).eql(result);
      });
      it('should preserve indents', function() {
        var str = multiline(function() {
          /*

    $mycolor: #00ff00;
  $mypadding:   3px;
          */
        }),
        variables = {
          mypadding: '5px'
        },
        result = multiline(function() {
          /*

    $mycolor: #00ff00;
  $mypadding:   5px;
          */
        }),
        changed = parser.setVariables(str, 'scss', variables);
        expect(changed).eql(result);
      });
      it('should preserve comments', function() {
        var str = '' +
          '$mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '$mypadding: 3px;',
        variables = {
          mypadding: '0'
        },
        result = '' +
          '$mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '$mypadding: 0;',
        changed = parser.setVariables(str, 'scss', variables);
        expect(changed).eql(result);
      });
    });
    describe('LESS syntax', function() {
      it('should change single value variable', function() {
        var str = multiline(function() {
          /*
  @mycolor: #00ff00;
  @mypadding: 3px;
  @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        variables = {
          mycolor: '#0000ff',
          mypadding: '5px'
        },
        result = multiline(function() {
          /*
  @mycolor: #0000ff;
  @mypadding: 5px;
  @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        changed = parser.setVariables(str, 'less', variables);
        expect(changed).eql(result);
      });

      it('should change complex value variable', function() {
        var str = multiline(function() {
          /*
  @mycolor: #00ff00;
  @mypadding: 3px;
  @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        variables = {
          myfont: '"Helvetica Neue", Tahoma'
        },
        result = multiline(function() {
          /*
  @mycolor: #00ff00;
  @mypadding: 3px;
  @myfont:   "Helvetica Neue", Tahoma;
          */
        }),
        changed = parser.setVariables(str, 'less', variables);
        expect(changed).eql(result);
      });
      it('should preserve indents', function() {
        var str = multiline(function() {
          /*

    @mycolor: #00ff00;

  @mypadding:   3px;
          */
        }),
        variables = {
          mypadding: '5px'
        },
        result = multiline(function() {
          /*

    @mycolor: #00ff00;

  @mypadding:   5px;
          */
        }),
        changed = parser.setVariables(str, 'less', variables);
        expect(changed).eql(result);
      });
      it('should preserve comments', function() {
        var str = '' +
          '@mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '@mypadding: 3px;',
        variables = {
          mypadding: '0'
        },
        result = '' +
          '@mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '@mypadding: 0;',
        changed = parser.setVariables(str, 'less', variables);
        expect(changed).eql(result);
      });
    });
  });
});
