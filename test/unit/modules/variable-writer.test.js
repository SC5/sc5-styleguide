var requireModule = require('requirefrom')('lib/modules'),
  chai = require('chai'),
  expect = chai.expect,
  multiline = require('multiline'),
  writer = requireModule('variable-writer');

describe('Variable Writer', function() {

  describe('for SCSS syntax', function() {

    it('should change single value variable', function() {
      var str = multiline(function() {
          /*
           $mycolor: #00ff00;
           $mypadding: 3px;
           $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
           */
        }),
        variables = [
          {name: 'mycolor', value: '#0000ff'},
          {name: 'mypadding', value: '5px'}
        ],
        result = multiline(function() {
          /*
           $mycolor: #0000ff;
           $mypadding: 5px;
           $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
           */
        }),
        changed = writer.setVariables(str, 'scss', variables);
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
        variables = [
          {name: 'myfont', value: '"Helvetica Neue", Tahoma'}
        ],
        result = multiline(function() {
          /*
           $mycolor: #00ff00;
           $mypadding: 3px;
           $myfont:   "Helvetica Neue", Tahoma;
           */
        }),
        changed = writer.setVariables(str, 'scss', variables);
      expect(changed).eql(result);
    });

    it('should preserve indents', function() {
      var str = multiline(function() {
          /*

           $mycolor: #00ff00;
           $mypadding:   3px;
           */
        }),
        variables = [
          {name: 'mypadding', value: '5px'}
        ],
        result = multiline(function() {
          /*

           $mycolor: #00ff00;
           $mypadding:   5px;
           */
        }),
        changed = writer.setVariables(str, 'scss', variables);
      expect(changed).eql(result);
    });

    it('should preserve inline comments', function() {
      var str = multiline(function() {
          /*
           $mycolor: #00ff00;
           //
           $mypadding: 3px;
           */
        }),
        variables = [
          {name: 'mypadding', value: '0'}
        ],
        result = multiline(function() {
          /*
           $mycolor: #00ff00;
           //
           $mypadding: 0;
           */
        }),
        changed = writer.setVariables(str, 'scss', variables);
      expect(changed).eql(result);
    });

    it('should preserve comments', function() {
      var str = '' +
          '$mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '$mypadding: 3px;',
        variables = [
          {name: 'mypadding', value: '0'}
        ],
        result = '' +
          '$mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '$mypadding: 0;',
        changed = writer.setVariables(str, 'scss', variables);
      expect(changed).eql(result);
    });
  });

  describe('for LESS syntax', function() {
    it('should change single value variable', function() {
      var str = multiline(function() {
          /*
           @mycolor: #00ff00;
           @mypadding: 3px;
           @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
           */
        }),
        variables = [
          {name: 'mycolor', value: '#0000ff'},
          {name: 'mypadding', value: '5px'}
        ],
        result = multiline(function() {
          /*
           @mycolor: #0000ff;
           @mypadding: 5px;
           @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
           */
        }),
        changed = writer.setVariables(str, 'less', variables);
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
        variables = [
          {name: 'myfont', value: '"Helvetica Neue", Tahoma'}
        ],
        result = multiline(function() {
          /*
           @mycolor: #00ff00;
           @mypadding: 3px;
           @myfont:   "Helvetica Neue", Tahoma;
           */
        }),
        changed = writer.setVariables(str, 'less', variables);
      expect(changed).eql(result);
    });

    it('should preserve indents', function() {
      var str = multiline(function() {
          /*

           @mycolor: #00ff00;

           @mypadding:   3px;
           */
        }),
        variables = [
          {name: 'mypadding', value: '5px'}
        ],
        result = multiline(function() {
          /*

           @mycolor: #00ff00;

           @mypadding:   5px;
           */
        }),
        changed = writer.setVariables(str, 'less', variables);
      expect(changed).eql(result);
    });

    it('should preserve multiline comments', function() {
      var str = '' +
          '@mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '@mypadding: 3px;',
        variables = [
          {name: 'mypadding', value: '0'}
        ],
        result = '' +
          '@mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '@mypadding: 0;',
        changed = writer.setVariables(str, 'less', variables);
      expect(changed).eql(result);
    });

  });

});
