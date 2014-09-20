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
  this.buffer = '';
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
    console.log('data', data);
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

RotelCtl.prototype.command = function(command, cb) {
  var self = this;
  self.sp.write(command, function(err) {
    if (err) {
      return cb(err);
    }
    self.sp.drain(function(err) {
      cb(err);
    });
  });
};

var rctl = new RotelCtl('/dev/ttyUSB0');
rctl.open(function(err) {
  if (err) {
    return console.error(err);
  }
  rctl.command('get_display!', function(err) {
    if (err) {
      return console.error(err);
    }
    rctl.close(function(err) {
      if (err) {
        return console.log(err);
      }
    });
  });
});
