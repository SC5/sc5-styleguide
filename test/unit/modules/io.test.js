'use strict';

var proxyquire = require('proxyquire'),
  path = require('path'),
  chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  expect = chai.expect,
  ioPath = path.resolve(process.cwd(), 'lib/modules/io');

chai.use(sinonChai);

describe('module io', function() {

  var fs, writer, server, socket, opt, ioModule, io;
  beforeEach(setUp);

  describe('emitProgressStart()', function() {

    it('emits socket event "styleguide progress start"', function() {
      io.emitProgressStart();
      expect(socket.emit).to.have.been.calledWith('styleguide progress start');
    });

  });

  describe('emitCompileSuccess()', function() {

    it('emits socket event "styleguide compile success"', function() {
      io.emitCompileSuccess();
      expect(socket.emit).to.have.been.calledWith('styleguide compile success');
    });

    it('emits socket event "styleguide progress end"', function() {
      io.emitCompileSuccess();
      expect(socket.emit).to.have.been.calledWith('styleguide progress end');
    });

  });

  describe('emitCompileError()', function() {

    it('emits socket event "styleguide compile error" with error data', function() {
      var error = { message: 'fail' };
      io.emitCompileError(error);
      expect(socket.emit).to.have.been.calledWith('styleguide compile error', error);
    });

    it('emits socket event "styleguide progress end"', function() {
      io.emitCompileError();
      expect(socket.emit).to.have.been.calledWith('styleguide progress end');
    });

  });

  describe('socket connection listener', function() {
    var listener;

    beforeEach(function() {
      listener = server.on.getCall(0).args[1];
    });

    it('is registered on socket "connection" event', function() {
      expect(server.on).to.have.been.calledWith('connection');
      expect(listener).to.be.a('function');
    });

    it('registers listener on "variables to server" event', function() {
      listener.call(undefined, socket);
      expect(socket.on).to.have.been.calledWith('variables to server');
    });

    it('emits "styleguide compile success" on connection event if previous compile succeeded', function() {
      io.emitCompileSuccess();
      socket.emit.reset();
      listener.call(undefined, socket);
      expect(socket.emit).to.have.been.calledWith('styleguide compile success').and.calledWith('styleguide progress end');
    });

    it('emits "styleguide compile error" on connection event if previous compile failed', function() {
      io.emitCompileError();
      socket.emit.reset();
      listener.call(undefined, socket);
      expect(socket.emit).to.have.been.calledWith('styleguide compile error').and.calledWith('styleguide progress end');
    });
  });

  describe('save variables', function() {
    var newVariables = [
      {
        file: 'first_file.less',
        fileHash: 'ab',
        name: 'myvar1',
        value: 'myvalue1'
      },
      {
        file: 'second_file.scss',
        fileHash: 'cd',
        name: 'myvar3',
        value: 'myvalue3'
      },
      {
        file: 'first_file.less',
        fileHash: 'ab',
        name: 'myvar2',
        value: 'myvalue2'
      }
    ];

    beforeEach(function(done) {
      opt.styleVariables = 'test/vars.scss';
      opt.fileHashes.ab = '/absolute/path/first_file.less';
      opt.fileHashes.cd = '/absolute/path/second_file.scss';

      // Stub the file system module
      sinon.stub(fs, 'readFile');
      sinon.stub(fs, 'writeFile');

      fs.readFile
        .withArgs('/absolute/path/first_file.less', sinon.match.any, sinon.match.func)
        .callsArgWith(2, null, 'First file content');

      fs.readFile
        .withArgs('/absolute/path/second_file.scss', sinon.match.any, sinon.match.func)
        .callsArgWith(2, null, 'Second file content');

      fs.writeFile
        .withArgs('/absolute/path/first_file.less', sinon.match.any, sinon.match.func)
        .callsArgWith(2, null, 'Changed first file content');

      fs.writeFile
        .withArgs('/absolute/path/second_file.scss', sinon.match.any, sinon.match.func)
        .callsArgWith(2, null, 'Changed cecond file content');

      io.saveVariables(newVariables).then(function() {
        done();
      });
    });

    it('should call set variables with the original file contents and variables from that file', function() {
      var firstFileVars = [{
        file: 'first_file.less',
        fileHash: 'ab',
        name: 'myvar1',
        value: 'myvalue1'
      },
      {
        file: 'first_file.less',
        fileHash: 'ab',
        name: 'myvar2',
        value: 'myvalue2'
      }],
      secondFileVars = [{
        file: 'second_file.scss',
        fileHash: 'cd',
        name: 'myvar3',
        value: 'myvalue3'
      }];
      expect(writer.setVariables).to.have.been.calledWith('First file content', 'less', firstFileVars);
      expect(writer.setVariables).to.have.been.calledWith('Second file content', 'scss', secondFileVars);
    });

  });

  function setUp() {
    socket = {
      conn: { id: '123' },
      emit: sinon.spy(),
      on: sinon.spy()
    };

    server = {
      sockets: socket,
      on: sinon.spy()
    };

    opt = {
      styleVariables: null,
      fileHashes: {}
    };

    fs = {};
    writer = { setVariables: sinon.spy() };

    ioModule = proxyquire(ioPath, {
      fs: fs,
      './variable-writer': writer
    });

    io = ioModule(server, opt);
  }

});
