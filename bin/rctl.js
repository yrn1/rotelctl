#!/usr/bin/env node

"use strict";

var rotelctl = require('./../lib/rotelctl');

if (process.argv.length < 3) {
  return console.error('Usage: '+ process.argv[1] +' <command> [arg]');
}

var commandName = process.argv[2];
if (typeof rotelctl.RotelCtl.prototype[commandName] !== 'function') {
  return console.error('Unknown command "'+ commandName +'"');
}

var rctl = new rotelctl.RotelCtl('/dev/ttyUSB0');

rctl.open(function(err) {
  if (err) {
    return console.error(err);
  }
  var args = [];
  if (process.argv.length > 3) {
    args.push(process.argv[3]);
  }
  args.push(function(err, response){
    if (err) {
      console.error(err);
    } else {
      console.log(response);
    }
    rctl.close(function(err){
      if (err) {
        console.error(err);
      }
    });
  });
  rotelctl.RotelCtl.prototype[commandName].apply(rctl, args);
});
