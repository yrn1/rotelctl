"use strict";
var debug = require('debug')('rotelctl');
var events = require('events');
var util = require('util');
var serialport = require("serialport");

exports.list = function(cb) {
  serialport.list(cb);
};

var RotelCtl = exports.RotelCtl = function(port) {
  events.EventEmitter.call(this);
  this.port = port;
  this.buffer = new Buffer(0);
  this.handlerQueue = [];
};
util.inherits(RotelCtl, events.EventEmitter);

RotelCtl.prototype.open = function(cb) {
  var self = this;
  self.sp = new serialport.SerialPort("/dev/ttyUSB0", {
    baudrate: 115200,
    databits: 8,
    stopbits: 1,
    parity: 'none'
  });

  var openErrorListener = function(err) {
    self.sp.removeListener('error', openErrorListener);
    cb(err);
  };

  self.sp.once('open', function(err) {
    if (err) {
      return cb(err);
    }
    debug('open');
    self.sp.removeListener('error', openErrorListener);
    self.sp.on('error', function(err) {
      self.emit('error', err);
    });
    cb(null);
  });
  self.sp.once('error', openErrorListener);

  self.sp.on('data', function(data) {
    self.receive(data);
  });
  self.sp.on('close', function() {
    debug('close');
    self.sp = null;
  });
};

RotelCtl.prototype.close = function(cb) {
  this.sp.close(cb);
  this.sp = null;
};

RotelCtl.prototype.receive = function(data) {
  this.buffer = Buffer.concat([this.buffer, data]);
  this._processData();
};

RotelCtl.prototype._processData = function() {
  var self = this;
  debug('data "' + self.buffer + '"');
  if (self.handlerQueue.length > 0) {
    var handler = self.handlerQueue[0];
    debug('handler', handler);
    var responseKey = self.buffer.slice(0, handler.response.length + 1).toString();
    debug('responseKey', responseKey);
    if (responseKey === handler.response + '=') {
      debug('responseKey found');
      var sizeString = '';
      var i;
      for (i = handler.response.length + 2; i < self.buffer.length && String.fromCharCode(self.buffer[i]) !== ','; i++) {
        sizeString += String.fromCharCode(self.buffer[i]);
        debug('sizeString', sizeString);
      }
      if (String.fromCharCode(self.buffer[i]) === ',') {
        var size = parseInt(sizeString, 10);
        debug('size', size);
        if (i + 1 + size <= self.buffer.length) {
          var responseMsg = self.buffer.slice(i + 1, i + 1 + size).toString(); // TODO special chars
          debug('responseMsg', responseMsg);
          self.buffer = Buffer.concat([self.buffer.slice(i + 1 + size)]);
          self.handlerQueue.shift();
          handler.cb(null, responseMsg);
          setImmediate(self._processData.bind(self));
        }
      }
    }
  }
};

RotelCtl.prototype.getDisplay = function(command, cb) {
  var self = this;
  var handler = {response: 'display', sized: true, cb: cb};
  self.handlerQueue.push(handler);
  self.sp.write(command, function(err) {
    if (err) {
      self.handlerQueue.splice(self.handlerQueue.indexOf(handler), 1);
      return cb(err);
    }
  });
};