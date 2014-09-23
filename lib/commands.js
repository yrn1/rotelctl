"use strict";

module.exports = {
  // control commands
  "powerOn": {command: 'power_on!', response: 'power_', sized: false},
  "powerOff": {command: 'power_off!', response: 'power_', sized: false},
  "powerToggle": {command: 'power_toggle!', response: 'power_', sized: false},
  "volumeUp": {command: 'volume_up!', response: 'volume=', sized: false},
  "volumeDown": {command: 'volume_down!', response: 'volume=', sized: false},
  "volumeMax": {command: 'volume_max!', response: 'volume=', sized: false},
  "volumeMin": {command: 'volume_min!', response: 'volume=', sized: false},
//  volume_n!
//  Set Volume to level n (n = 1 - 86)
//  volume=##!
  "muteToggle": {command: 'mute!', response: 'mute=', sized: false},
  "muteOn": {command: 'mute_on!', response: 'mute=', sized: false},
  "muteOff": {command: 'mute_off!', response: 'mute=', sized: false},

  "displayUpdateAuto": {command: 'display_update_auto!', response: 'display_update=', sized: false},
  "displayUpdateManual": {command: 'display_update_manual!', response: 'display_update=', sized: false},
  // status request commands
  "getDisplay": {command: 'get_display!', response: 'display=', sized: true},
  "getDisplay1": {command: 'get_display1!', response: 'display1=', sized: true},
  "getDisplay2": {command: 'get_display2!', response: 'display2=', sized: true},
  "getProductType": {command: 'get_product_type!', response: 'product_type=', sized: true},
  "getProductVersion": {command: 'get_product_version!', response: 'product_version=', sized: true},
  "getTcVersion": {command: 'get_tc_version!', response: 'tc_version=', sized: true},
  "getDisplaySize": {command: 'get_display_size!', response: 'display_size=', sized: false},
  "getDisplayUpdate": {command: 'get_display_update!', response: 'display_update=', sized: false},
  "getCurrentPower": {command: 'get_current_power!', response: 'power=', sized: false},
  "getCurrentSource": {command: 'get_current_source!', response: 'source=', sized: false},
  "getTone": {command: 'get_tone!', response: 'tone=', sized: false},
  "getBass": {command: 'get_bass!', response: 'bass=', sized: false},
  "getTreble": {command: 'get_treble!', response: 'treble=', sized: false},
  "getBalance": {command: 'get_balance!', response: 'balance=', sized: false},
  "getCurrentFrequency": {command: 'get_current_freq!', response: 'freq=', sized: false},
  "getPlayStatus": {command: 'get_play_status!', response: 'play_status=', sized: false},
  "getVolumeMax": {command: 'get_volume_max!', response: 'volume_max=', sized: false},
  "getVolumeMin": {command: 'get_volume_min!', response: 'volume_min=', sized: false},
  "getVolume": {command: 'get_volume!', response: 'volume=', sized: false},
  "getToneMax": {command: 'get_tone_max!', response: 'tone_max=', sized: false}
};