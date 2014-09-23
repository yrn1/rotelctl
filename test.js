"use strict";
var rotelctl = require('./lib/rotelctl');
var async = require('async');

var rctl = new rotelctl.RotelCtl('/dev/ttyUSB0');
rctl.open(function(err) {
  if (err) {
    return console.error(err);
  }
  async.parallel({
    'getDisplay': rctl.getDisplay.bind(rctl),
    'getDisplay1': rctl.getDisplay1.bind(rctl),
    'getDisplay2': rctl.getDisplay2.bind(rctl),
    'getProductType': rctl.getProductType.bind(rctl),
    'getProductVersion': rctl.getProductVersion.bind(rctl),
    'getTcVersion': rctl.getTcVersion.bind(rctl)
  }, function(err, results) {
    if (err) {
      console.error(err);
    } else {
      console.log(results);
    }
    rctl.close(function(err) {
      if (err) {
        return console.error(err);
      }
    });
  });
});
