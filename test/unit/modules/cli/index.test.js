'use strict';

import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import index from '~/lib/modules/cli/index';
import argv from '~/lib/modules/cli/argv';
import styleguide from '~/lib/modules/cli/styleguide-cli';

chai.use(sinonChai);

describe('index', () => {
    it('should load argv.js', () => {
        expect(index.argv).to.deep.eql(argv);
    });

    it('should load styleguide-cli.js', () => {
        expect(index.styleguide).to.deep.eql(styleguide);
    });
});