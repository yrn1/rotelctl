#!/usr/bin/env node

"use strict";
var rotelctl = require('./../lib/rotelctl');
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
    'getTcVersion': rctl.getTcVersion.bind(rctl),
    'getDisplaySize': rctl.getDisplaySize.bind(rctl),
    'getDisplayUpdate': rctl.getDisplayUpdate.bind(rctl),
    'getCurrentPower': rctl.getCurrentPower.bind(rctl),
    'getCurrentSource': rctl.getCurrentSource.bind(rctl),
    'getTone': rctl.getTone.bind(rctl),
    'getBass': rctl.getBass.bind(rctl),
    'getTreble': rctl.getTreble.bind(rctl),
    'getBalance': rctl.getBalance.bind(rctl),
    'getCurrentFrequency': rctl.getCurrentFrequency.bind(rctl),
    'getPlayStatus': rctl.getPlayStatus.bind(rctl),
    'getVolumeMax': rctl.getVolumeMax.bind(rctl),
    'getVolumeMin': rctl.getVolumeMin.bind(rctl),
    'getVolume': rctl.getVolume.bind(rctl),
    'getToneMax': rctl.getToneMax.bind(rctl)
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
