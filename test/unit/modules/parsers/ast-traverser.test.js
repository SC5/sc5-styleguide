var requireModule = require('requirefrom')('lib/modules'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  traverser = requireModule('parsers/ast-traverser');

describe('AST Traverser', function() {

  var ast = {
    type: 'styleguide',
    content: [{
      type: 'declaration',
      content: [{
        type: 'variable',
        content: [{
          type: 'ident',
          content: 'mycolor'
        }]
      }]
    }]
  };

  it('should return an array', function() {
    var visitor = {
      test: function() {},
      process: function() {}
    },
    result = traverser.traverse(ast, visitor);

    expect(result).to.be.an('Array');
  });

  it('should call test for each node', function() {
    var spy = sinon.spy(),
    visitor = {
      test: spy,
      process: function() {}
    };

    traverser.traverse(ast, visitor);
    expect(spy.callCount).to.eql(4);
  });

  it('should call process for each passing test', function() {
    var spy = sinon.spy(),
    visitor = {
      test: function() {
        return true;
      },
      process: function(node) {
        spy();
        return node;
      }
    };

    traverser.traverse(ast, visitor);
    expect(spy.callCount).to.eql(4);
  });

  it('should not call process if test returns false', function() {
    var spy = sinon.spy(),
    visitor = {
      test: function() {
        return false;
      },
      process: function(node) {
        spy();
        return node;
      }
    };

    traverser.traverse(ast, visitor);
    expect(spy.callCount).to.eql(0);
  });

});
