var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    pseudoSelectors = requireModule('pseudo-selectors');

describe('Pseudo selector parsing', function() {
  it('should filter out styles that does not contain pseudo selectors', function() {
    var str = multiline(function() {
      /*
.style1 {
  background: red;
}
.style2:active {
  background: green;
}
.style3 {
  background: red;
}
      */
    }),
    result = multiline(function() {
      /*
.style2.pseudo-class-active {
  background: green;
}
      */
    });
    expect(pseudoSelectors.stylesFromString(str)).to.eql(result);
  });

  it('should replace multiple pseudo selectors on one line', function() {
    var str = multiline(function() {
      /*
.style1,
.style2:hover,
.style3:visited {
  background: green;
}
      */
    }),
    result = multiline(function() {
      /*
.style2.pseudo-class-hover,
.style3.pseudo-class-visited {
  background: green;
}
      */
    });
    expect(pseudoSelectors.stylesFromString(str)).to.eql(result);
  });

  it('should replace multiple pseudo selectors on same style', function() {
    var str = multiline(function() {
      /*
.style1:first-child:hover {
  background: green;
}
      */
    }),
    result = multiline(function() {
      /*
.style1.pseudo-class-first-child.pseudo-class-hover {
  background: green;
}
      */
    });
    expect(pseudoSelectors.stylesFromString(str)).to.eql(result);
  });

  it('should ignore unknown pseudo selectors', function() {
    var str = multiline(function() {
      /*
.style:unknown {
  background: red;
}
      */
    });
    expect(pseudoSelectors.stylesFromString(str)).to.be.empty;
  });

  it('should not replace pseudo selectors when they appear inside :not clause', function() {
    var str = multiline(function() {
      /*
.style:not(:first-child) {
  background: red;
}
      */
    });
    expect(pseudoSelectors.stylesFromString(str)).to.be.empty;
  });

  it('should replace pseudo selectors that are outside the :not clause', function() {
    var str = multiline(function() {
      /*
.style:not(:first-child):hover {
  background: red;
}
      */
    }),
    result = multiline(function() {
      /*
.style:not(:first-child).pseudo-class-hover {
  background: red;
}
      */
    });
    expect(pseudoSelectors.stylesFromString(str)).to.eql(result);
  });
});
