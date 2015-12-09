'use strict';

import chai, { expect } from 'chai';
import path from 'path';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

var ioPath = path.resolve(process.cwd(), 'lib/modules/io');

chai.use(sinonChai);

describe('module io', () => {

  var fs, parser, server, sockets, opt, ioModule, io;
  beforeEach(setUp);

  describe('emitProgressStart()', () => {

    it('emits "styleguide progress start" to all sockets', () => {
      io.emitProgressStart();
      expect(sockets.emit).to.have.been.calledWithExactly('styleguide progress start');
    });

  });

  describe('emitProgressEnd()', () => {

    it('emits "styleguide progress end" to all sockets', () => {
      io.emitProgressEnd();
      expect(sockets.emit).to.have.been.calledWithExactly('styleguide progress end');
    });

  });

  describe('emitCompileSuccess()', () => {

    it('emits "styleguide compile success" to all sockets if called without arguments', () => {
      io.emitCompileSuccess();
      expect(sockets.emit).to.have.been.calledWithExactly('styleguide compile success');
    });

    it('emits "styleguide compile success" to specified socket', () => {
      var socket = fakeSocket();
      io.emitCompileSuccess(socket);
      expect(socket.emit).to.have.been.calledWithExactly('styleguide compile success');
      expect(sockets.emit).not.to.have.been.called;
    });

  });

  describe('emitCompileError()', () => {

    it('emits event "styleguide compile error" with error to all sockets if called only with error argument', () => {
      var error = { message: 'fail' },
        payload = {
          name: 'Compile error',
          message: 'fail',
          wrappedError: error
        };
      io.emitCompileError(error);
      expect(sockets.emit).to.have.been.calledWithExactly('styleguide compile error', payload);
    });

    it('emits event "styleguide compile error" with error to specified socket', () => {
      var error = { message: 'fail' },
        payload = {
          name: 'Compile error',
          message: 'fail',
          wrappedError: error
        },
        socket = fakeSocket();
      io.emitCompileError(error, socket);
      expect(socket.emit).to.have.been.calledWithExactly('styleguide compile error', payload);
      expect(sockets.emit).not.to.have.been.called;
    });

  });

  describe('emitStylesChanged', () => {

    it('emits "styleguide styles changed" to all sockets', () => {
      io.emitStylesChanged();
      expect(sockets.emit).to.have.been.calledWithExactly('styleguide styles changed');
    });

  });

  describe('socket connection listener', () => {
    var listener, socket;

    beforeEach(() => {
      listener = server.on.getCall(0).args[1];
      socket = fakeSocket();
    });

    it('is registered on socket "connection" event', () => {
      expect(server.on).to.have.been.calledWithExactly('connection', sinon.match.func);
      expect(listener).to.be.a('function');
    });

    it('registers listener on "variables to server" event', () => {
      listener.call(undefined, socket);
      expect(socket.on).to.have.been.calledWithExactly('variables to server', sinon.match.func);
    });

    it('emits "styleguide compile success" on connection event if previous compile succeeded', () => {
      io.emitCompileSuccess();
      listener.call(undefined, socket);
      expect(socket.emit).to.have.been.calledWithExactly('styleguide compile success');
    });

    it('emits "styleguide compile error" on connection event if previous compile failed', () => {
      var error = { message: 'fail' },
        payload = {
          name: 'Compile error',
          message: 'fail',
          wrappedError: error
        };
      io.emitCompileError(error);
      socket.emit.reset();
      listener.call(undefined, socket);
      expect(socket.emit).to.have.been.calledWithExactly('styleguide compile error', payload);
    });
  });

  describe('#saveVariables', () => {
    var newVariables = [
        {
          file: 'first_file.less',
          fileHash: 'first',
          name: 'myvar1',
          value: 'myvalue1'
        },
        {
          file: 'second_file.scss',
          fileHash: 'second',
          name: 'myvar3',
          value: 'myvalue3'
        },
        {
          file: 'first_file.less',
          fileHash: 'first',
          name: 'myvar2',
          value: 'myvalue2'
        }
      ],
      fsOpts = { encoding: 'utf8' };

    beforeEach(() => {
      opt.styleVariables = 'test/vars.scss';
      opt.fileHashes.first = '/absolute/path/first_file.less';
      opt.fileHashes.second = '/absolute/path/second_file.scss';

      fs.readFileSync
        .withArgs(opt.fileHashes.first, fsOpts)
        .returns('First file content');

      fs.readFileSync
        .withArgs(opt.fileHashes.second, fsOpts)
        .returns('Second file content');
    });

    describe('in the happy case scenario', () => {

      it('reads each variable file once', (done) => {
        io.saveVariables(newVariables).done(() => {
          expect(fs.readFileSync).to.have.been.calledWithExactly(opt.fileHashes.first, fsOpts);
          expect(fs.readFileSync).to.have.been.calledWithExactly(opt.fileHashes.second, fsOpts);
          expect(fs.readFileSync).to.have.been.calledTwice;
          done();
        }, done);
      });

      it('replaces variables in each file with new variables', (done) => {
        var firstFileVars = [newVariables[0], newVariables[2]],
          secondFileVars = [newVariables[1]];
        io.saveVariables(newVariables).done(() => {
          expect(parser.setVariables).to.have.been.calledWithExactly('First file content', 'less', firstFileVars, opt);
          expect(parser.setVariables).to.have.been.calledWithExactly('Second file content', 'scss', secondFileVars, opt);
          expect(parser.setVariables).to.have.been.calledTwice;
          done();
        }, done);
      });

      it('checks new variable syntax for each file with variable-parser', (done) => {
        parser.setVariables.withArgs('First file content', 'less').returns('updated first file');
        parser.setVariables.withArgs('Second file content', 'scss').returns('updated second file');
        io.saveVariables(newVariables).done(() => {
          expect(parser.parseVariableDeclarations).to.have.been.calledWithExactly('updated first file', 'less', opt);
          expect(parser.parseVariableDeclarations).to.have.been.calledWithExactly('updated second file', 'scss', opt);
          expect(parser.parseVariableDeclarations).to.have.been.calledTwice;
          done();
        }, done);
      });

      it('writes new contents for each file', (done) => {
        parser.setVariables.withArgs('First file content', 'less').returns('updated first file');
        parser.setVariables.withArgs('Second file content', 'scss').returns('updated second file');
        io.saveVariables(newVariables).done(() => {
          expect(fs.writeFileSync).to.have.been.calledWithExactly(opt.fileHashes.first, 'updated first file', fsOpts);
          expect(fs.writeFileSync).to.have.been.calledWithExactly(opt.fileHashes.second, 'updated second file', fsOpts);
          expect(fs.writeFileSync).to.have.been.calledTwice;
          done();
        }, done);
      });

      it('emits "variables saved to server" via same socket on success', function(done) {
        var sock = {
          variableSaveListener: null,
          conn: { id: 1 },
          on: function(event, fn) {
            this.variableSaveListener = fn;
          },
          emit: function(event) {
            if (event === 'variables saved to server') {
              done();
            }
          }
        };
        server.on.lastCall.args[1].call(undefined, sock);
        sock.variableSaveListener(newVariables);
      });

    });

    it('does not update any files if reading the original file fails', (done) => {
      fs.readFileSync = sinon.stub().throws(Error('ENOENT'));
      io.saveVariables(newVariables).done(() => {
        done(Error('expected promise to be rejected due to fs.readFileSync error'));
      }, (err) => {
        expect(err.message).to.eql('ENOENT');
        expect(fs.writeFileSync).not.to.have.been.called;
        done();
      });
    });

    it('does not update any files if updating the variable values fails', (done) => {
      parser.setVariables.throws(Error('cannot update'));
      io.saveVariables(newVariables).done(() => {
        done(Error('expected promise to be rejected due to variable-writer error'));
      }, (err) => {
        expect(err.message).to.eql('cannot update');
        expect(fs.writeFileSync).not.to.have.been.called;
        done();
      });
    });

    it('does not update any files if checking a file syntax fails', (done) => {
      parser.parseVariableDeclarations.throws(Error('invalid syntax'));
      io.saveVariables(newVariables).done(() => {
        done(Error('expected promise to be rejected due to variable-parser error'));
      }, (err) => {
        expect(err.message).to.eql('invalid syntax');
        expect(fs.writeFileSync).not.to.have.been.called;
        done();
      });
    });

    it('emits "styleguide validation error" with error via same socket if saving variables fails', function(done) {
      var error = Error('invalid syntax'),
        payload = {
          name: 'Validation error',
          message: 'invalid syntax',
          wrappedError: error
        },
        sock = {
        variableSaveListener: null,
        conn: { id: 1 },
        on: function(event, fn) {
          this.variableSaveListener = fn;
        },
        emit: function(event, data) {
          if (event === 'styleguide validation error') {
            expect(data).to.eql(payload);
            done();
          }
        }
      };
      parser.parseVariableDeclarations.throws(error);
      server.on.lastCall.args[1].call(undefined, sock);
      sock.variableSaveListener(newVariables);
    });

  });

  function setUp() {
    sockets = {
      conn: { id: '123' },
      emit: sinon.spy(),
      on: sinon.spy()
    };

    server = {
      sockets: sockets,
      on: sinon.spy()
    };

    opt = {
      fileHashes: {}
    };

    fs = {
      readFileSync: sinon.stub(),
      writeFileSync: sinon.stub()
    };
    parser = {
      parseVariableDeclarations: sinon.stub(),
      setVariables: sinon.stub()
    };

    ioModule = proxyquire(ioPath, {
      fs: fs,
      './variable-parser': parser
    });

    io = ioModule(server, opt);
  }

  function fakeSocket() {
    return {
      conn: { id: 1 },
      on: sinon.spy(),
      emit: sinon.spy()
    };
  }

});
