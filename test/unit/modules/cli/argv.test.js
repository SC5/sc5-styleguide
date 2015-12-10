'use strict';

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import argv from '~/lib/modules/cli/argv';

var mockApi = ['usage', 'example', 'demand', 'describe'],
  required = ['kssSource', 'styleSource', 'output'],
  optional = ['title', 'extraHead', 'commonClass', 'appRoot', 'styleVariables', 'server', 'overviewPath', 'port', 'watch'];

chai.use(sinonChai);

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

describe('cli arguments', () => {

  var spy, args;

  beforeEach(() => {
    spy = mock(mockApi);
    args = argv(spy);
  });

  it('returns the passed arg itself', () => {
    expect(args).to.deep.eql(spy);
  });

  it('registers usage', () => {
    expect(spy.usage).to.have.been.calledWith(sinon.match.string);
  });

  it('has an example', () => {
    expect(spy.example).to.have.been.calledWith(sinon.match.string);
  });

  describe('requires argument', () => {
    required.forEach((arg) => {
      it(arg, () => {
        expect(spy.demand, 'demand').to.have.been.calledWith(arg);
      });
    });
  });

  describe('allows optional argument', () => {
    optional.forEach((arg) => {
      it(arg, () => {
        expect(spy.demand, 'demand').not.to.have.been.calledWith(arg);
      });
    });
  });

  describe('describes argument', () => {
    required.concat(optional).forEach((arg) => {
      it(arg, () => {
        expect(spy.describe, 'describe').to.have.been.calledWith(arg);
      });
    });
  });

});

function mock(api) {
  return api.reduce((spy, func) => {
    spy[func] = sinon.stub().returns(spy);
    return spy;
  }, {});
}
