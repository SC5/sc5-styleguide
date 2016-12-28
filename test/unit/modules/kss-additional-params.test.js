//jscs:disable disallowTrailingWhitespace
//jscs:disable disallowMultipleLineBreaks
import { expect } from 'chai';
import kssAdditionalParams from '~/lib/modules/kss-additional-params';

describe('Parsing KSS additional params', () => {

  it('Should parse from singleline-commented block', () => {
    // jscs:disable
    var str = `// sg-param:
// Value`,
      // jscs:enable
      result = { 'sg-param': 'Value' },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should parse with KSS modifiers', () => {
    // jscs:disable
    var str = `default - Default button
:hover - Hover button
:active - Active button

sg-param:
Value`,
    result = { 'sg-param': 'Value' },
    value = kssAdditionalParams.get(str);
    // jscs:enable
    expect(value).eql(result);
  });

  it('should parse windows linebreaks correctly', () => {
    // jscs:disable
    /*jshint -W109 */
    var str = "/*\r\n// sg-param:\r\n// Value\r\n*/\r\n",
      str2 = "/*\r// sg-param:\r// Value\r*/\r",
      result = { 'sg-param': 'Value' };
    // jscs:enable
    expect(kssAdditionalParams.get(str)).eql(result);
    expect(kssAdditionalParams.get(str2)).eql(result);
  });

  it('Should parse from multiline-commented block', () => {
    var str = '' +
        '/*\n' +
        'sg-param:\n' +
        'Value' +
        '*/',
      result = { 'sg-param': 'Value' },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should parse multiple params', () => {
    // jscs:disable
    var str = `// sg-param1:
// Value
//
// sg-param2:
// Value
//
// sg-param3:
// Value`,
      // jscs:enable
      result = {
        'sg-param1':'Value',
        'sg-param2':'Value',
        'sg-param3':'Value'
      },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should gulp different space combinations', () => {
    // jscs:disable
    var str = `// sg-param1 :
// Value
//
//sg-param2:
// Value
//
//   sg-param3:
// Value`,
      // jscs:enable
      result = {
        'sg-param1':'Value',
        'sg-param2':'Value',
        'sg-param3':'Value'
      },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should ignore extra comments', () => {
    // jscs:disable
    var str = `// Something here
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
// Value`,
      // jscs:enable
      result = {
        'sg-param1':'Value',
        'sg-param2':'Value',
        'sg-param3':'Value'
      },
      params = kssAdditionalParams.get(str);

    expect(params).eql(result);
  });

  it('Should parse complex variables', () => {
    // jscs:disable
    var str = ` sg-angular-directive:
 name: sgAppTest
 template: demo/testDirective.html
 file: demo/testDirective.js`,
      // jscs:enable
      result = {
        name: 'sgAppTest',
        file: 'demo/testDirective.js',
        template: 'demo/testDirective.html'
      },
      value = kssAdditionalParams.getValue('sg-angular-directive', str);

    expect(value).eql(result);
  });

  it('Should parse complex variables with 2 nexted values', () => {
    // jscs:disable
    var str = ` sg-angular-directive:
 name: sgAppTest
 template: demo/testDirective.html
 file: demo/testDirective.js
 file: demo/testDirective2.js`,
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

  it('Should parse complex variables with many nexted values', () => {
    // jscs:disable
    var str = ` sg-angular-directive:
 name: sgAppTest
 template: demo/testDirective.html
 file: demo/testDirective.js
 file: demo/testDirective2.js
 file: demo/testDirective3.js
 file: demo/testDirective4.js`,
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

  it('Should parse complex variables with comma notation', () => {
    // jscs:disable
    var str = ` sg-angular-directive:
 name: sgAppTest
 template: demo/testDirective.html
 file: demo/testDirective.js, demo/testDirective2.js`,
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

  it('Should ignore extra spaces when parsing complex variables', () => {
    // jscs:disable
    var str = ` sg-angular-directive:
 name: sgAppTest
 template:  demo/testDirective.html
 file:   demo/testDirective.js , demo/testDirective2.js
 file:   demo/testDirective3.js`,
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

  it('Should parse only listed params as comples', () => {
    // jscs:disable
    var str = ` sg-another-custom-param:
 param1: val1
 param2: val2`,
      result = ` param1: val1
 param2: val2`,
      value = kssAdditionalParams.getValue('sg-another-custom-param', str);
    // jscs:enable
    expect(value).eql(result);
  });

});
