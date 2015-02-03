'use strict';

var path = require('path'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  argv = require(path.resolve(__dirname, '../../../../lib/modules/cli/argv')),
  mockApi = ['usage', 'example', 'demand', 'describe'],
  required = ['kssSource', 'styleSource', 'output'],
  optional = ['title', 'extraHead', 'commonClass', 'appRoot', 'styleVariables', 'server', 'overviewPath', 'port', 'watch'];

chai.use(require('sinon-chai'));

/**
 * override .calledWith default failure message (prints the whole object) with something more readable
 */
chai.Assertion.addMethod('calledWith', function(arg) {
  var obj = this._obj;
  this.assert(
    obj.calledWith(arg) === true,
    'expected function to have been called with #{exp}',
    'expected function not to have been called with #{exp}',
    arg,
    ''
  );
});

describe('cli arguments', function() {

  var spy, args;

  beforeEach(function() {
    spy = mock(mockApi);
    args = argv(spy);
  });

  it('returns the passed arg itself', function() {
    expect(args).to.deep.eql(spy);
  });

  it('registers usage', function() {
    expect(spy.usage).to.have.been.calledWith(sinon.match.string);
  });

  it('has an example', function() {
    expect(spy.example).to.have.been.calledWith(sinon.match.string);
  });

  describe('requires argument', function() {
    required.forEach(function(arg) {
      it(arg, function() {
        expect(spy.demand, 'demand').to.have.been.calledWith(arg);
      });
    });
  });

  describe('allows optional argument', function() {
    optional.forEach(function(arg) {
      it(arg, function() {
        expect(spy.demand, 'demand').not.to.have.been.calledWith(arg);
      });
    });
  });

  describe('describes argument', function() {
    required.concat(optional).forEach(function(arg) {
      it(arg, function() {
        expect(spy.describe, 'describe').to.have.been.calledWith(arg);
      });
    });
  });

});

function mock(api) {
  return api.reduce(function(spy, func) {
    spy[func] = sinon.stub().returns(spy);
    return spy;
  }, {});
}
