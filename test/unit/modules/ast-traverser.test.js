import { expect } from 'chai';
import sinon from 'sinon';
import traverser from '~/lib/modules/ast-traverser';

describe('AST Traverser', () => {

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

  it('should return an array', () => {
    var visitors = {
      sass: {
        // jscs:disable
        // JSCS does not allow empty ES6 funcitons thinking they are empty blocks.
        // Wait for the new version of JSCS, then check
        test: () => {},
        process: () => {}
        // jscs:enable
      }
    },
    result = traverser.traverse(ast, [visitors.sass]);

    expect(result).to.be.an('Array');
  });

  it('should call test for each node', () => {
    var spy = sinon.spy(),
    visitors = {
      sass: {
        test: spy,
        // jscs:disable
        // JSCS does not allow empty ES6 funcitons thinking they are empty blocks.
        // Wait for the new version of JSCS, then check
        process: () => {}
        // jscs:enable
      }
    };

    traverser.traverse(ast, [visitors.sass]);
    expect(spy.callCount).to.eql(4);
  });

  it('should call process for each passing test', () => {
    var spy = sinon.spy(),
    visitors = {
      sass: {
        test: () => {
          return true;
        },
        process: (node) => {
          spy();
          return node;
        }
      }
    };

    traverser.traverse(ast, [visitors.sass]);
    expect(spy.callCount).to.eql(4);
  });

  it('should not call process if test returns false', () => {
    var spy = sinon.spy(),
    visitors = {
      sass: {
        test: () => {
          return false;
        },
        process: (node) => {
          spy();
          return node;
        }
      }
    };

    traverser.traverse(ast, [visitors.sass]);
    expect(spy.callCount).to.eql(0);
  });

});
