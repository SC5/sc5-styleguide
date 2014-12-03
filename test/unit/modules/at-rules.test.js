var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    atRules = requireModule('at-rules');

describe('At ruke parsing', function() {
  it('should get @font-face definitions', function() {
    var str = multiline(function() {
      /*
@font-face {
  font-family: myFont;
}

.someSelector {
}
      */
    }),
    result = multiline(function() {
      /*
@font-face {
  font-family: myFont;
}
      */
    });
    expect(atRules.stylesFromString(str)).to.eql(result);
  });

  it('should get @keyframe definitions', function() {
    var str = multiline(function() {
      /*
@-webkit-keyframes mymove {

}

@keyframes mymove {

}

.someSelector {
}
      */
    }),
    result = multiline(function() {
      /*
@-webkit-keyframes mymove {
}

@keyframes mymove {
}
      */
    });
    expect(atRules.stylesFromString(str)).to.eql(result);
  });
});
