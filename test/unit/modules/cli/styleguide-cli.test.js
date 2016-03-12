'use strict';

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import styleguide from '~/lib/modules/cli/styleguide-cli';
import gulp from 'gulp';

chai.use(sinonChai);

describe('styleguide-cli', () => {

    var spy = sinon.spy(console, 'error');

    it('should be a function', () => {
        expect(styleguide).to.be.a('function');
    });

    it('should error when no arguments are supplied', () => {
        styleguide();
        expect(spy.called).to.be.true;
    });

    it('should create gulp tasks', () => {
        styleguide();
        expect(gulp.tasks).to.contain.all.keys([
            'styleguide:generate',
            'styleguide:applystyles',
            'watch:kss',
            'watch:styles'
        ]);
    });
});