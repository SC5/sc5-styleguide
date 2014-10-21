var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  multiline = require('multiline'),
  parser = require('../lib/parser')();

describe('Parser', function() {
  describe('variable parser', function() {
    it('should parse basic variables', function() {
      var str = multiline(function() {
        /*
$mycolor: #00ff00;
$mypadding: 3px;
$myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
        */
      }),
      result = {
        mycolor: '#00ff00',
        mypadding: '3px',
        myfont: '"Helvetica Neue", Helvetica, Arial, sans-serif'
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
        mycolor: '#00ff00',
        mypadding: '3px',
        myfont: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      };
      expect(parser.parseVariables(str)).eql(result);
    });

    it('should parse variables correct when there are multiple variables in a single line', function() {
      var str = multiline(function() {
        /*
$color1: #ff0000; $color2: #00ff00; $color3: #0000ff;
        */
      }),
      result = {
        color1: '#ff0000',
        color2: '#00ff00',
        color3: '#0000ff'
      };
    });
  });

  describe('variable setter', function() {
    it('should generate valid SASS file when original file is empty', function() {
      var variables = {
        mycolor: '#00ff00',
        mypadding: '3px',
        myfont: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      },
      result = multiline(function() {
        /*
$mycolor: #00ff00;
$myfont: "Helvetica Neue", Helvetica, Arial, sans-serif;
$mypadding: 3px;
        */
      });
      expect(parser.setVariables('', variables)).eql(result);
    });
  });
});
