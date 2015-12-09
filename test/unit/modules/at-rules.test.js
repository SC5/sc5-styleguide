import { expect } from 'chai';
import atRules from '~/lib/modules/at-rules';

describe('At ruke parsing', () => {
  it('should get @font-face definitions', () => {
    var str = `@font-face {
  font-family: myFont;
}

.someSelector {
}`,
    result = `@font-face {
  font-family: myFont;
}`;

    expect(atRules.stylesFromString(str)).to.eql(result);
  });

  it('should get @keyframe definitions', () => {
    var str = `@-webkit-keyframes mymove {

}

@keyframes mymove {

}

.someSelector {
}`,
    result = `@-webkit-keyframes mymove {
}

@keyframes mymove {
}`;
    expect(atRules.stylesFromString(str)).to.eql(result);
  });
});
