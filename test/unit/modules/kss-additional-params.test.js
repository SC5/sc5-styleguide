//jscs:disable disallowTrailingWhitespace
//jscs:disable disallowMultipleLineBreaks
var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    kssAdditionalParams = requireModule('kss-additional-params');

describe('Parsing KSS additional params', function() {

  it('Should parse from singleline-commented block', function() {
    // jscs:disable
    var str = multiline(function() {
      /*
// sg-param:
// Value
      */
      }),
      // jscs:enable
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
    // jscs:disable
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
      // jscs:enable
      result = {
        'sg-param1':' Value',
        'sg-param2':' Value',
        'sg-param3':' Value'
      },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should gulp different space combinations', function() {
    // jscs:disable
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
      // jscs:enable
      result = {
        'sg-param1':' Value',
        'sg-param2':' Value',
        'sg-param3':' Value'
      },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should ignore extra comments', function() {
    // jscs:disable
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
      // jscs:enable
      result = {
        'sg-param1':' Value',
        'sg-param2':' Value',
        'sg-param3':' Value'
      },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should parse complex variables', function() {
    // jscs:disable
    var str = multiline(function() {
      /*
 sg-angular-directive:
 name: sgAppTest
 template: demo/testDirective.html
 file: demo/testDirective.js
      */
      }),
      // jscs:enable
      result = {
        name: 'sgAppTest',
        file: 'demo/testDirective.js',
        template: 'demo/testDirective.html'
      },
      value = kssAdditionalParams.getValue('sg-angular-directive', str);

    expect(value).eql(result);
  });

  it('Should parse complex variables with 2 nexted values', function() {
    // jscs:disable
    var str = multiline(function() {
      /*
 sg-angular-directive:
 name: sgAppTest
 template: demo/testDirective.html
 file: demo/testDirective.js
 file: demo/testDirective2.js
      */
      }),
      // jscs:enable
      result = {
        name: 'sgAppTest',
        file: [
          'demo/testDirective.js',
          'demo/testDirective2.js'
          ],
        template: 'demo/testDirective.html'
      },
      value = kssAdditionalParams.getValue('sg-angular-directive', str);

    expect(value).eql(result);
  });

  it('Should parse complex variables with many nexted values', function() {
    // jscs:disable
    var str = multiline(function() {
      /*
 sg-angular-directive:
 name: sgAppTest
 template: demo/testDirective.html
 file: demo/testDirective.js
 file: demo/testDirective2.js
 file: demo/testDirective3.js
 file: demo/testDirective4.js
      */
      }),
      // jscs:enable
      result = {
        name: 'sgAppTest',
        file: [
          'demo/testDirective.js',
          'demo/testDirective2.js',
          'demo/testDirective3.js',
          'demo/testDirective4.js'
          ],
        template: 'demo/testDirective.html'
      },
      value = kssAdditionalParams.getValue('sg-angular-directive', str);
    expect(value).eql(result);
  });

  it('Should parse complex variables with comma notation', function() {
    // jscs:disable
    var str = multiline(function() {
      /*
 sg-angular-directive:
 name: sgAppTest
 template: demo/testDirective.html
 file: demo/testDirective.js, demo/testDirective2.js
      */
      }),
      // jscs:enable
      result = {
        name: 'sgAppTest',
        file: [
          'demo/testDirective.js',
          'demo/testDirective2.js'
          ],
        template: 'demo/testDirective.html'
      },
      value = kssAdditionalParams.getValue('sg-angular-directive', str);
    expect(value).eql(result);
  });

  it('Should ignore extra spaces when parsing complex variables', function() {
    // jscs:disable
    var str = multiline(function() {
      /*
 sg-angular-directive:
 name: sgAppTest
 template:  demo/testDirective.html
 file:   demo/testDirective.js , demo/testDirective2.js
 file:   demo/testDirective3.js
      */
      }),
      // jscs:enable
      result = {
        name: 'sgAppTest',
        file: [
          'demo/testDirective.js',
          'demo/testDirective2.js',
          'demo/testDirective3.js'
          ],
        template: 'demo/testDirective.html'
      },
      value = kssAdditionalParams.getValue('sg-angular-directive', str);
    expect(value).eql(result);
  });

  it('Should parse only listed params as comples', function() {
    // jscs:disable
    var str = multiline(function() {
      /*
 sg-another-custom-param:
 param1: val1
 param2: val2
      */
      }),
      result = multiline(function() {
      /*
 param1: val1
 param2: val2
      */
      }),
      value = kssAdditionalParams.getValue('sg-another-custom-param', str);
    // jscs:enable
    expect(value).eql(result);
  });
});
