var requireModule = require('requirefrom')('lib/modules'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  traverser = requireModule('ast-traverser');

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
    var visitors = {
      sass: {
        test: function() {},
        process: function() {}
      }
    },
    result = traverser.traverse(ast, [visitors.sass]);

    expect(result).to.be.an('Array');
  });

  it('should call test for each node', function() {
    var spy = sinon.spy(),
    visitors = {
      sass: {
        test: spy,
        process: function() {}
      }
    };

    traverser.traverse(ast, [visitors.sass]);
    expect(spy.callCount).to.eql(4);
  });

  it('should call process for each passing test', function() {
    var spy = sinon.spy(),
    visitors = {
      sass: {
        test: function() {
          return true;
        },
        process: function(node) {
          spy();
          return node;
        }
      }
    };

    traverser.traverse(ast, [visitors.sass]);
    expect(spy.callCount).to.eql(4);
  });

  it('should not call process if test returns false', function() {
    var spy = sinon.spy(),
    visitors = {
      sass: {
        test: function() {
          return false;
        },
        process: function(node) {
          spy();
          return node;
        }
      }
    };

    traverser.traverse(ast, [visitors.sass]);
    expect(spy.callCount).to.eql(0);
  });

});
