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

  var fs, parser, server, socket, opt, ioModule, io;
  beforeEach(setUp);

  describe('initialized with options.styleVariables', function() {

    var styleFile;
    beforeEach(function() {
      sinon.spy(console, 'error');
      styleFile = 'foo/bar.scss';
      opt.styleVariables = styleFile;
      fs.existsSync = sinon.stub().withArgs(styleFile).returns(false);
      io = ioModule(server, opt);
    });

    afterEach(function() {
      console.error.restore();
    });

    it('logs error to console if file does not exist', function() {
      expect(console.error).to.have.been.calledWith('Could not find SASS variables file', styleFile);
    });

    it('causes module to return undefined if file does not exist', function() {
      expect(io).to.be.undefined;
    });

  });

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

    it('registers listener on "request variables from server" event', function() {
      listener.call(undefined, socket);
      expect(socket.on).to.have.been.calledWith('request variables from server');
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

  describe('loading variables', function() {

    var listener,
        readCallback;

    beforeEach(function() {
      sinon.spy(console, 'error');
      opt.styleVariables = 'test/vars.scss';
      listener = getSocketListener('request variables from server');
      fs.readFile = sinon.spy();

      listener.call();
      readCallback = fs.readFile.lastCall.args[2];
    });

    afterEach(function() {
      console.error.restore();
    });

    it('reads file defined in options.styleVariables', function() {
      expect(fs.readFile).to.have.been.calledWith(opt.styleVariables, { encoding: 'utf8' });
    });

    it('passes file contents to variable parser.parseVariables', function() {
      var fileData = '$foo: 10px;';
      readCallback.call(undefined, undefined, fileData);
      expect(parser.parseVariables).to.have.been.calledWith(fileData, 'scss');
    });

    it('emits variable data with socket event "variables from server"', function() {
      var data = [{ name: 'foo', value: '10px' }];
      parser.parseVariables = sinon.stub().returns(data);
      readCallback.call();
      expect(socket.emit).to.have.been.calledWith('variables from server', data);
    });

    it('only logs error to console if reading variables file fails', function() {
      socket.emit.reset();
      readCallback.call(undefined, 'read fail');
      expect(console.error).to.have.been.calledWith('read fail');
      expect(parser.parseVariables).not.to.have.been.called;
      expect(socket.emit).not.to.have.been.called;
    });

  });

  describe('saving variables', function() {

    var listener,
        readCallback,
        writeCallback,
        fileData = '$foo: 10px;',
        newVariables = [{ name: 'foo', value: '16px' }],
        newData = '$foo: 16px;';

    beforeEach(function() {
      sinon.spy(console, 'error');
      opt.styleVariables = 'test/vars.scss';
      listener = getSocketListener('variables to server');
      fs.readFile = sinon.spy();
      fs.writeFile = sinon.spy();

      listener.call(undefined, newVariables);
      readCallback = fs.readFile.lastCall.args[2];
    });

    afterEach(function() {
      console.error.restore();
    });

    it('reads file defined in options.styleVariables', function() {
      expect(fs.readFile).to.have.been.calledWith(opt.styleVariables, { encoding: 'utf8' });
    });

    it('passes original file contents to variable parser.setVariables', function() {

      readCallback.call(undefined, undefined, fileData);
      expect(parser.setVariables).to.have.been.calledWith(fileData, 'scss');
    });

    it('passes new variables to variable parser.setVariables', function() {
      readCallback.call(undefined, undefined, fileData);
      expect(parser.setVariables).to.have.been.calledWith(fileData, 'scss', newVariables);
    });

    it('writes data returned from parser.setVariables() to options.styleVariables file', function() {
      parser.setVariables = sinon.stub().returns(newData);
      readCallback();
      expect(fs.writeFile).to.have.been.calledWith(opt.styleVariables, newData);
    });

    it('emits new variable data with socket event "variables saved to server"', function() {
      readCallback();
      writeCallback = fs.writeFile.lastCall.args[2];

      writeCallback.call(undefined, undefined, newData);
      expect(socket.emit).to.have.been.calledWith('variables saved to server', newData);
    });

    it('only logs error to console if writing new variables data fails', function() {
      socket.emit.reset();
      readCallback.call();
      writeCallback = fs.writeFile.lastCall.args[2];

      writeCallback.call(undefined, 'write fail');
      expect(console.error).to.have.been.calledWith('write fail');
      expect(socket.emit).not.to.have.been.called;
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

    opt = {};
    fs = {};
    parser = {
      parseVariables: sinon.spy(),
      setVariables: sinon.spy()
    };

    ioModule = proxyquire(ioPath, {
      fs: fs,
      './variable-parser': parser
    });

    io = ioModule(server, opt);
  }

  function getSocketListener(event) {
    var connectionListener = server.on.lastCall.args[1];
    connectionListener.call(undefined, socket);
    for (var i = 0; i < socket.on.callCount; i += 1) {
      if (socket.on.getCall(i).args[0] === event) {
        return socket.on.getCall(i).args[1];
      }
    }
  }

});
