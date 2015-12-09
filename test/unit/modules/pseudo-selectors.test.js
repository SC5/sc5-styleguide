import { expect } from 'chai';
import pseudoSelectors from '~/lib/modules/pseudo-selectors';

describe('Pseudo selector parsing', () => {
  it('should filter out styles that does not contain pseudo selectors', () => {
    var str = `.style1 {
  background: red;
}
.style2:active {
  background: green;
}
.style3 {
  background: red;
}`,
    result = `.style2.pseudo-class-active {
  background: green;
}`;
    expect(pseudoSelectors.stylesFromString(str)).to.eql(result);
  });

  it('should replace multiple pseudo selectors on one line', () => {
    var str = `.style1,
.style2:hover,
.style3:visited {
  background: green;
}`,
    result = `.style2.pseudo-class-hover,
.style3.pseudo-class-visited {
  background: green;
}`;
    expect(pseudoSelectors.stylesFromString(str)).to.eql(result);
  });

  it('should replace multiple pseudo selectors on same style', () => {
    var str = `.style1:first-child:hover {
  background: green;
}`,
    result = `.style1.pseudo-class-first-child.pseudo-class-hover {
  background: green;
}`;
    expect(pseudoSelectors.stylesFromString(str)).to.eql(result);
  });

  it('should ignore unknown pseudo selectors', () => {
    var str = `
.style:unknown {
  background: red;
}`;
    expect(pseudoSelectors.stylesFromString(str)).to.be.empty;
  });

  it('should not replace pseudo selectors when they appear inside :not clause', () => {
    var str = `.style:not(:first-child) {
  background: red;
}`;
    expect(pseudoSelectors.stylesFromString(str)).to.be.empty;
  });

  it('should replace pseudo selectors that are outside the :not clause', () => {
    var str = `.style:not(:first-child):hover {
  background: red;
}`,
    result = `.style:not(:first-child).pseudo-class-hover {
  background: red;
}`;
    expect(pseudoSelectors.stylesFromString(str)).to.eql(result);
  });
});
