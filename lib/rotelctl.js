"use strict";
var commands = require('./commands');
var parser = require('./parser');
var debug = require('debug')('rotelctl');
var events = require('events');
var util = require('util');
const { SerialPort } = require('serialport');

exports.list = function(cb) {
  SerialPort.list(cb);
};

var RotelCtl = exports.RotelCtl = function(port) {
  events.EventEmitter.call(this);
  this._open = false;
  this.port = port;
  this._buffer = Buffer.alloc(0);
  this._handlerQueue = [];
};
util.inherits(RotelCtl, events.EventEmitter);

RotelCtl.prototype.open = function(cb) {
  var self = this;
  self.sp = new SerialPort({
    path: self.port,
    baudRate: 115200,
    databits: 8,
    stopbits: 1,
    parity: 'none'
  });

  if (typeof cb === 'function') {
    var openErrorListener = function(err) {
      self.sp.removeListener('error', openErrorListener);
      cb(err);
    };

    self.sp.once('open', function(err) {
      if (err) {
        return cb(err);
      }
      debug('open');
      self._open = true;
      self.emit('open');
      self.sp.removeListener('error', openErrorListener);
      self.sp.on('error', function(err) {
        self.emit('error', err);
      });
      cb(null);
    });
    self.sp.once('error', openErrorListener);
  } else {
    self.sp.on('open', function(err) {
      debug('open');
      self._open = true;
      self.emit('open', err);
    });
    self.sp.on('error', function(err) {
      self.emit('error', err);
    });
  }

  self.sp.on('data', function(data) {
    self._receive(data);
  });
  self.sp.on('close', function() {
    debug('close');
    self._open = false;
    self.emit('close');
    self.sp = null;
  });
};

RotelCtl.prototype.close = function(cb) {
  if (this.sp) {
    this.sp.close(cb);
  }
  this.sp = null;
};

RotelCtl.prototype._receive = function(data) {
  this._buffer = Buffer.concat([this._buffer, data]);
  this._processData();
};

RotelCtl.prototype._processData = function() {
  var self = this;

  var result = parser.parse(self._buffer);
  self._buffer = result.buffer;
  result.responses.forEach(function(response) {
    debug('processing response', response);
    if (self._handlerQueue.length > 0) {
      var handler = self._handlerQueue[0];
      if (response.name === handler.response) {
        debug('handling response with callback', handler);
        handler.cb(null, response.value);
        self._handlerQueue.shift();
      } else {
        debug('head of callbacks does not handle response', handler);
      }
    }
    self.emit('data', response);
  });
};

RotelCtl.prototype.command = function(commandInfo, cb) {
  var self = this;
  if (typeof cb === 'function') {
    var handler = {response: commandInfo.response, cb: cb};
    self._handlerQueue.push(handler);
  }
  self.sp.write(commandInfo.command, function(err) {
    if (err) {
      if (typeof cb === 'function') {
        self._handlerQueue.splice(self._handlerQueue.indexOf(handler), 1);
        return cb(err);
      }
      self.emit('error', err);
    }
  });
};

RotelCtl.prototype.volume = function(amount, cb) {
  var self = this;
  if (amount < 0 || amount > 99) {
    var err = new Error('Volume should be >= 0 and <= 99');
    if (typeof cb === 'function') {
      return cb(err);
    }
    self.emit('error', err);
  }
  if (typeof cb === 'function') {
    var handler = {response: 'volume', sized: false, cb: cb};
    self._handlerQueue.push(handler);
  }
  self.sp.write('volume_' + amount + '!', function(err) {
    if (err) {
      if (typeof cb === 'function') {
        self._handlerQueue.splice(self._handlerQueue.indexOf(handler), 1);
        return cb(err);
      }
      self.emit('error', err);
    }
  });
};

RotelCtl.prototype.isOpen = function() {
  return this._open;
};

Object.keys(commands).forEach(function(command) {
  var name = command;
  var commandInfo = commands[command];

  if (RotelCtl.prototype[name]) {
    return;
  }

  RotelCtl.prototype[name] = function() {
    var args = Array.prototype.slice.call(arguments);
    var callback = null;
    if (typeof args[args.length - 1] === 'function') {
      callback = args.splice(-1)[0];
    }
    this.command(commandInfo, callback);
  };
});