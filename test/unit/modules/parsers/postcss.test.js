import { expect } from 'chai';
import parser from '~/lib/modules/parsers/postcss.js';

describe('PostCSS parser', () => {

  describe('finding used variables', () => {

    it('should return all used variables', () => {
      var str = `.testStyle {
          color: var(--mycolor1);
          border: 1px solid var(--mycolor2);
        }
        .testStyle2 {
          background-color: var(--mycolor3);
        }`,
      result = ['mycolor1', 'mycolor2', 'mycolor3'];
      expect(parser.findVariables(str)).eql(result);
    });

    it('should not return new variable definitions', () => {
      var str = `--mycolor: #00ff00;
        .testStyle {
          color: var(--mycolor2);
        }`,
      result = ['mycolor2'];
      expect(parser.findVariables(str)).eql(result);
    });

    it('should find variables that are used as function arguments', () => {
      var str = `.testStyle {
          color: rgba(var(--mycolor));
        }`,
      result = ['mycolor'];
      expect(parser.findVariables(str)).eql(result);
    });

    it('should not find variables from variable declarations', () => {
      var str = `.testStyle {
          --sum: var(--var1) + var(--var2);
        }`,
      result = [];
      expect(parser.findVariables(str)).eql(result);
    });
  });

  describe('finding variable declarations', () => {

    it('should parse basic variables', () => {
      var str = `--mycolor: #00ff00;
        --mypadding: 3px;
        --myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;`,
      result = [
        {name: 'mycolor', value: '#00ff00', line: 1},
        {name: 'mypadding', value: '3px', line: 2},
        {name: 'myfont', value: '"Helvetica Neue", Helvetica, Arial, sans-serif', line: 3}
      ];
      expect(parser.parseVariableDeclarations(str)).eql(result);
    });

    it('should not consider spaces', () => {
      var str = `--mycolor :#00ff00;
        --mymargin : 2em;
        --mypadding: 3px;`,
        result = [
          {name: 'mycolor', value: '#00ff00', line: 1},
          {name: 'mymargin', value: '2em', line: 2},
          {name: 'mypadding', value: '3px', line: 3}
        ];
        expect(parser.parseVariableDeclarations(str)).eql(result);
      });

    it('should not detect variables that are only used not declarared', () => {
      var str = `.testStyle {
          color: var(--myvar);
        }`;
      expect(parser.parseVariableDeclarations(str)).eql([]);
    });

    it('should not return variables that are used as function arguments', () => {
      var str = `.testStyle {
          color: rgba(var(--mycolor), var(--myopacity));
        }`;
      expect(parser.parseVariableDeclarations(str)).eql([]);
    });

    it('should handle cases when variable value is another variable', () => {
      var str = `--var1: var(--another);`,
      result = [{
        name: 'var1',
        value: 'var(--another)',
        line: 1
      }];
      expect(parser.parseVariableDeclarations(str)).eql(result);
    });

    it('should parse variables correct when there are multiple variables in a single line', () => {
      var str = '--color1: #ff0000; --color2: #00ff00; --color3: #0000ff;',
        result = [
          {name: 'color1', value: '#ff0000', line: 1},
          {name: 'color2', value: '#00ff00', line: 1},
          {name: 'color3', value: '#0000ff', line: 1}
        ];
      expect(parser.parseVariableDeclarations(str)).eql(result);
    });

    it('should not take commented variables', () => {
      var str = '/* --color1: #ff0000; */';
      expect(parser.parseVariableDeclarations(str)).eql([]);
    });
  });

  describe('settings variables', () => {

    it('should only change variable declaration', () => {
      var str = `.foo {
             --primary-color: #fdf70a;
             background-color: var(--primary-color);
           }`,
        variables = [
          {name: 'primary-color', value: '#00ff00'}
        ],
        result = `.foo {
             --primary-color: #00ff00;
             background-color: var(--primary-color);
           }`,
        changed = parser.setVariables(str, variables);
      expect(changed).eql(result);
    });

    it('should change single value variable', () => {
      var str = `--mycolor: #00ff00;
           --mypadding: 3px;
           --myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;`,
        variables = [
          {name: 'mycolor', value: '#0000ff'},
          {name: 'mypadding', value: '5px'}
        ],
        result = `--mycolor: #0000ff;
           --mypadding: 5px;
           --myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;`,
        changed = parser.setVariables(str, variables);
      expect(changed).eql(result);
    });

    it('should change complex value variable', () => {
      var str = `--mycolor: #00ff00;
           --mypadding: 3px;
           --myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;`,
        variables = [
          {name: 'myfont', value: '"Helvetica Neue", Tahoma'}
        ],
        result = `--mycolor: #00ff00;
           --mypadding: 3px;
           --myfont:   "Helvetica Neue", Tahoma;`,
        changed = parser.setVariables(str, variables);
      expect(changed).eql(result);
    });

    it('should preserve indents', () => {
      var str = `
           --mycolor: #00ff00;
           --mypadding:   3px;`,
        variables = [
          {name: 'mypadding', value: '5px'}
        ],
        result = `
           --mycolor: #00ff00;
           --mypadding:   5px;`,
        changed = parser.setVariables(str, variables);
      expect(changed).eql(result);
    });

    it('should preserve comments', () => {
      var str = '' +
          '--mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '--mypadding: 3px;',
        variables = [
          {name: 'mypadding', value: '0'}
        ],
        result = '' +
          '--mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '--mypadding: 0;',
        changed = parser.setVariables(str, variables);
      expect(changed).eql(result);
    });
  });
});
