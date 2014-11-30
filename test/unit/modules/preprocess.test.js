'use strict';

var proxyquire = require('proxyquire'),
  path = require('path'),
  vinylHelper = require('./vinyl-helper'),
  chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  expect = chai.expect,
  preprocessPath = path.resolve(process.cwd(), 'lib/modules/preprocess');

chai.use(sinonChai);

describe('preprocessor', function() {

  var srcGlob, opt, errback, files, fakeVinyl, preprocessor;
  beforeEach(setUp);

  describe('.getStream()', function() {

    it('is a function', function() {
      expect(preprocessor.getStream).to.be.a('function');
    });

    it('returns a readable stream', function() {
      var stream = preprocessor.getStream(srcGlob, opt, errback);
      expect(stream).to.have.property('pipe').and.be.a('function');
      expect(stream).to.have.property('on').and.be.a('function');
      expect(stream).to.have.property('readable').and.eql(true);
    });

    describe('reading sass files', function() {

      beforeEach(function() {
        opt.sass.src = 'sass-src/*';
        addFile('sass-src/sass.scss', '$foo: 1px; a.sass { top: $foo; }');
        addFile('sass-src/sass.txt', '$bar: 2px; a.sass-css { top: $bar; }');
      });

      it('uses opt.sass.src if defined', function() {
        preprocessor.getStream(srcGlob, opt, errback);
        expect(fakeVinyl.src).to.have.been.calledWith('sass-src/*');
      });

      it('includes any files matching opt.sass.src glob', function(done) {
        getCss(done).then(function(css) {
          expect(css).to.contain('a.sass {').and.contain('top: 1px;');
          expect(css).to.contain('a.sass-css {').and.contain('top: 2px;');
          done();
        }).catch(done);
      });

      it('includes only **/*.scss when src glob is used', function(done) {
        delete opt.sass.src;
        srcGlob = 'sass-src/**/*';
        getCss(done).then(function(css) {
          expect(css).to.contain('a.sass {').and.contain('top: 1px;');
          expect(css).to.not.contain('a.sass-css {').and.not.contain('top: 2px;');
          done();
        }).catch(done);
      });

      it('calls error callback if sass processing fails', function(done) {
        addFile('sass-src/error.scss', '$error = true;');
        preprocessor.getStream(srcGlob, opt, function(error) {
          expect(error).to.be.instanceof(Error);
          done();
        });
      });

    });

    describe('reading less files', function() {

      beforeEach(function() {
        opt.less.src = 'less-src/*';
        addFile('less-src/less.less', '@foo: 1px; a.less { top: @foo; }');
        addFile('less-src/less.txt', '@bar: 2px; a.less-css { top: @bar; }');
      });

      it('uses opt.less.src if defined', function() {
        preprocessor.getStream(srcGlob, opt, errback);
        expect(fakeVinyl.src).to.have.been.calledWith('less-src/*');
      });

      it('includes any files matching opt.less.src glob', function(done) {
        getCss(done).then(function(css) {
          expect(css).to.contain('a.less {').and.contain('top: 1px;');
          expect(css).to.contain('a.less-css {').and.contain('top: 2px;');
          done();
        }).catch(done);
      });

      it('includes only **/*.less when src glob is used', function(done) {
        delete opt.less.src;
        srcGlob = 'less-src/**/*';
        getCss(done).then(function(css) {
          expect(css).to.contain('a.less {').and.contain('top: 1px;');
          expect(css).to.not.contain('a.less-css {').and.not.contain('top: 2px;');
          done();
        }).catch(done);
      });

      it('calls error callback if less processing fails', function(done) {
        addFile('less-src/error.less', '@error = true;');
        preprocessor.getStream(srcGlob, opt, function(error) {
          expect(error).to.be.instanceof(Error);
          done();
        });
      });

    });

    describe('reading css files', function() {

      beforeEach(function() {
        opt.css.src = 'css-src/*';
        addFile('css-src/css.css', 'a.css { top: 1px; }');
        addFile('css-src/test.txt', 'a.css-text { top: 2px; }');
      });

      it('uses opt.css.src if defined', function() {
        preprocessor.getStream(srcGlob, opt, errback);
        expect(fakeVinyl.src).to.have.been.calledWith('css-src/*');
      });

      it('includes any files matching opt.css.src glob', function(done) {
        getCss(done).then(function(css) {
          expect(css).to.contain('a.css {').and.contain('top: 1px;');
          expect(css).to.contain('a.css-text {').and.contain('top: 2px;');
          done();
        }).catch(done);
      });

      it('includes only **/*.css when src glob is used', function(done) {
        delete opt.css.src;
        srcGlob = 'css-src/**/*';
        getCss(done).then(function(css) {
          expect(css).to.contain('a.css {').and.contain('top: 1px;');
          expect(css).to.not.contain('a.css-text {').and.not.contain('top: 2px;');
          done();
        }).catch(done);
      });

    });

    it('concatenates all processed streams into a single css file', function(done) {
      srcGlob = '**/*';
      addFile('sass/one.scss', '.sass { top: 1px; }');
      addFile('less/two.less', '.less { top: 2px; }');
      addFile('css/three.css', '.css { top: 3px; }');
      getCss(done).then(function(css) {
        expect(css).to.contain('.sass {').and.contain('top: 1px;');
        expect(css).to.contain('.less {').and.contain('top: 2px;');
        expect(css).to.contain('.css {').and.contain('top: 3px;');
        done();
      }).catch(done);
    });

  });

  function addFile(path, contents) {
    var f = vinylHelper.createFile({ path: path, contents: contents });
    files.push(f);
    return f;
  }

  function setUp() {

    srcGlob = 'sass/**/*';

    files = [];

    opt = {
      sass: {},
      less: {},
      css: {}
    };

    errback = sinon.spy(function() { });

    fakeVinyl = {
      src: sinon.spy(function(pattern) {
        return vinylHelper.src(files, pattern);
      })
    };

    preprocessor = proxyquire(preprocessPath, {
      'vinyl-fs': fakeVinyl
    });
  }

  function getCss(done) {
    var stream = preprocessor.getStream(srcGlob, opt, done);
    return vinylHelper.readStreamContents(stream).then(function(files) {
      return files[0].contents.toString();
    }).catch(done);
  }

});
