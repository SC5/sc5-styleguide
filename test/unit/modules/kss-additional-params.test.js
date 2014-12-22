//jscs:disable disallowTrailingWhitespace
//jscs:disable disallowMultipleLineBreaks
var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    kssAdditionalParams = requireModule('kss-additional-params');

describe('Parsing KSS additional params', function() {

  it('Should parse from singleline-commented block', function() {
    var str = multiline(function() {
      /*
// sg-param:
// Value
      */
      }),
      result = { 'sg-param': ' Value' },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should parse from multiline-commented block', function() {

    var str = '' +
        '/*\n' +
        ' sg-param:\n' +
        ' Value' +
        '*/',
      result = { 'sg-param': ' Value' },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should parse multiple params', function() {
    var str = multiline(function() {
      /*
// sg-param1:
// Value
//
// sg-param2:
// Value
//
// sg-param3:
// Value
      */
      }),
      result = {
        'sg-param1':' Value',
        'sg-param2':' Value',
        'sg-param3':' Value'
      },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should gulp different space combinations', function() {
    var str = multiline(function() {
      /*
// sg-param1 :
// Value
//
//sg-param2:
// Value
//
//   sg-param3:
// Value
      */
      }),
      result = {
        'sg-param1':' Value',
        'sg-param2':' Value',
        'sg-param3':' Value'
      },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should ignore extra comments', function() {
    var str = multiline(function() {
      /*
// Something here
//
// sg-param1 :
// Value
//
//sg-param2:
// Value
//
// sg-empty-param:
//
//   sg-param3:
// Value
      */
      }),
      result = {
        'sg-param1':' Value',
        'sg-param2':' Value',
        'sg-param3':' Value'
      },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should parse complex variables', function() {
    var str = multiline(function() {
      /*
 sg-angular-directive:
 template: demo/testDirective.html
 file: demo/testDirective.js
      */
      }),
      result = {
        'file': 'demo/testDirective.js',
        'template': 'demo/testDirective.html'
      },
      value = kssAdditionalParams.getValue('sg-angular-directive', str);

    expect(value).eql(result);
  });

});
