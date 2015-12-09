'use strict';

import { expect } from 'chai';
import ignoreBlock from '~/lib/modules/ignore-block';

describe('ignore block removal', () => {
  it('should remove definitions between tags and leave other lines intact', () => {
    var str = `First line
styleguide:ignore:start
Ignore 1
Ignore 2
styleguide:ignore:end
Last line`;

    expect(ignoreBlock.removeIgnoredBlocks(str)).to.eql('First line\n\n\n\n\nLast line');
  });

  it('should remove everything on the same line as tags', () => {
    var str = `First line
// styleguide:ignore:start something
Ignore 1
Ignore 2
// styleguide:ignore:end something
Last line`;
    expect(ignoreBlock.removeIgnoredBlocks(str)).to.eql('First line\n\n\n\n\nLast line');
  });

  it('should support multiple blocks', () => {
    var str = `First line
styleguide:ignore:start
Ignore 1
styleguide:ignore:end
Middle line
styleguide:ignore:start
Ignore 1
styleguide:ignore:end
Last line`;
    expect(ignoreBlock.removeIgnoredBlocks(str)).to.eql('First line\n\n\n\nMiddle line\n\n\n\nLast line');
  });

  it('should remove everything after start tag even if it is not closed', () => {
    var str = `First line
styleguide:ignore:start
Ignore 1
Ignore 2
Ignore 3`;
    expect(ignoreBlock.removeIgnoredBlocks(str)).to.eql('First line\n\n\n\n');
  });
});
