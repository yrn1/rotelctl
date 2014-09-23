"use strict";
var commands = require('./commands');
var debug = require('debug')('rotelctl');
var events = require('events');
var util = require('util');
var serialport = require('serialport');

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
  self.sp = new serialport.SerialPort(self.port, {
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

var parseSizedResponse = function(handler, rctl) {
  var sizeString = '';
  var i;
  for (i = handler.response.length; i < rctl.buffer.length && String.fromCharCode(rctl.buffer[i]) !== ','; i++) {
    sizeString += String.fromCharCode(rctl.buffer[i]);
    debug('sizeString "' + sizeString + '"');
  }
  if (String.fromCharCode(rctl.buffer[i]) === ',') {
    var size = parseInt(sizeString, 10);
    debug('size ' + size);
    if (i + 1 + size <= rctl.buffer.length) {
      var responseMsg = rctl.buffer.slice(i + 1, i + 1 + size).toString(); // TODO special chars
      debug('responseMsg "' + responseMsg + '"');
      rctl.buffer = Buffer.concat([rctl.buffer.slice(i + 1 + size)]);
      rctl.handlerQueue.shift();
      handler.cb(null, responseMsg);
      setImmediate(rctl._processData.bind(rctl));
    }
  }
};

var parseDelimitedResponse = function(handler, rctl) {
  var responseMsg = '';
  var i;
  for (i = handler.response.length; i < rctl.buffer.length && String.fromCharCode(rctl.buffer[i]) !== '!'; i++) {
    responseMsg += String.fromCharCode(rctl.buffer[i]);
  }
  if (String.fromCharCode(rctl.buffer[i]) === '!') {
    debug('responseMsg "' + responseMsg + '"');
    rctl.buffer = Buffer.concat([rctl.buffer.slice(i + 1)]);
    rctl.handlerQueue.shift();
    handler.cb(null, responseMsg);
    setImmediate(rctl._processData.bind(rctl));
  }
};

RotelCtl.prototype._processData = function() {
  var self = this;
  debug('data "' + self.buffer + '"');
  if (self.handlerQueue.length > 0) {
    var handler = self.handlerQueue[0];
    debug('handler ' + handler);
    var responseKey = self.buffer.slice(0, handler.response.length).toString();
    debug('responseKey "' + responseKey + '"');
    if (responseKey === handler.response) {
      debug('responseKey found');
      if (handler.sized) {
        parseSizedResponse(handler, self);
      } else {
        parseDelimitedResponse(handler, self);
      }
    }
  }
};

RotelCtl.prototype.command = function(commandInfo, cb) {
  var self = this;
  var handler = {response: commandInfo.response, sized: commandInfo.sized, cb: cb};
  self.handlerQueue.push(handler);
  self.sp.write(commandInfo.command, function(err) {
    if (err) {
      self.handlerQueue.splice(self.handlerQueue.indexOf(handler), 1);
      return cb(err);
    }
  });
};

RotelCtl.prototype.volume = function(amount, cb) {
  if (amount < 0) {
    return cb(new Error('Volume should be >= 0'));
  }
  if (amount > 99) {
    return cb(new Error('Volume should be <= 99'));
  }
  var self = this;
  var handler = {response: 'volume=', sized: false, cb: cb};
  self.handlerQueue.push(handler);
  self.sp.write('volume_' + amount + '!', function(err) {
    if (err) {
      self.handlerQueue.splice(self.handlerQueue.indexOf(handler), 1);
      return cb(err);
    }
  });
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