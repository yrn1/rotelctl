# Control Rotel amplifiers with RS232 connection

So far, this library has been tested with

* Rotel RA-12 V02

http://bwgroupsupport.com/download/rs232 lists several other Rotel components with a RS232 interface,
so if you find that it works with, or you want to add support for, any of these devices, please let
me know.

## Usage
### With callbacks

    var RotelCtl = require('rotelctl').RotelCtl;
    var rctl = new RotelCtl('/dev/ttyUSB0');
    
    rctl.open(function(err) {
      if (err) {
        return console.error(err);
      }
      rctl.getDisplay(function(err, response) {
        if (err) {
          return console.error(err);
        }
        console.log(response);
        rctl.close(function(err) {
          if (err) {
            return console.error(err);
          }
        });
      });
    });

### Without callbacks

    var RotelCtl = require('rotelctl').RotelCtl;
    var rctl = new RotelCtl('/dev/ttyUSB0');
    
    rctl.on('open', function() {
      console.log('open');
      rctl.getDisplay();
    });
    rctl.on('close', function() {
      console.log('close');
    });
    rctl.on('error', function(err) {
      console.log('error', err);
    });
    rctl.on('data', function(data) {
      console.log('data', data);
    });
    
    rctl.open();

## API

### Events

* open: when the serial connection has been opened
* close: when the serial connection has been closed
* error: on error
* data: when receiving data. The format of data is always

        {
          "name": "<name of data item>"
          "value": "<value of event>"
        }

    The _name_ of the different data items is described below.

### RotelCtl(port)

Create a new RotelCtl.

* port: the serial port device. E.g. /dev/ttyUSB0

### open([callback])

Open the serial connection.

* callback(err): optional callback, called when the serial port is opened.

### close([callback])

Close the serial connection.

* callback(err): optional callback, called when the serial port is closed.

### isOpen()

Returns true when the serial port has been opened.

## Rotel commands

All commands below take an optional callback(err, data).
_data_ is always the same value as the _value_ part of event triggered by the command.

Also see the Rotal documentation PDF in the docs directory.


### powerOn([callback])

Power on.

* event: ```{name:"power", value: power value}```

### powerOff([callback])

Power off.

* event: ```{name:"power", value: power value}```

### powerToggle([callback])

Toggle power.

* event: ```{name:"power", value: power value}```

### volumeUp([callback])

Increase volume a bit.

* event: ```{name:"volume", value: volume value}```

### volumeDown([callback])

Decrease volume a bit.

* event: ```{name:"volume", value: volume value}```

### volumeMax([callback])

Set volume to maximum.

* event: ```{name:"volume", value: volume value}```

### volumeMin([callback])

Set volume to minimum.

* event: ```{name:"volume", value: volume value}```

### volume(amount, [callback])

Set volume to _amount_.

* event: ```{name:"volume", value: volume value}```

### muteToggle([callback])

Toggle mute state.

* event: ```{name:"mute", value: mute value}```

### muteOn([callback])

Mute.

* event: ```{name:"mute", value: mute value}```

### muteOff([callback])

Unmute.

* event: ```{name:"mute", value: mute value}```

### rcd([callback])

Set source to Rotel CD.

* event: ```{name:"source", value: source value}```

### cd([callback])

Set source to CD.

* event: ```{name:"source", value: source value}```

### coax1([callback])

Set source to coax 1.

* event: ```{name:"source", value: source value}```

### coax2([callback])

Set source to coax 2.

* event: ```{name:"source", value: source value}```

### optical1([callback])

Set source to optical 1.

* event: ```{name:"source", value: source value}```

### optical2([callback])

Set source to optical 2.

* event: ```{name:"source", value: source value}```

### aux1([callback])

Set source to auxiliary 1.

* event: ```{name:"source", value: source value}```

### aux2([callback])

Set source to auxiliary 2.

* event: ```{name:"source", value: source value}```

### tuner([callback])

Set source to tuner.

* event: ```{name:"source", value: source value}```

### phono([callback])

Set source to phono.

* event: ```{name:"source", value: source value}```

### usb([callback])

Set source to usb (or bluetooth if dongle is installed).

* event: ```{name:"source", value: source value}```

### toneOn([callback])

Switch tone controls on.

* event: ```{name:"tone", value: tone value}```

### toneOff([callback])

Switch tone controls off.

* event: ```{name:"tone", value: tone value}```

### bassUp([callback])

Increase bass a bit.

* event: ```{name:"bass", value: bass value}```

### bassDown([callback])

Decrease bass a bit.

* event: ```{name:"bass", value: bass value}```

### bassMin([callback])

Set bass to minimum.

* event: ```{name:"bass", value: bass value}```

### bassNeutral([callback])

Set bass to neutral.

* event: ```{name:"bass", value: bass value}```

### BassMax([callback])

Set bass to maximum.

* event: ```{name:"bass", value: bass value}```

### trebleUp([callback])

Increase treble a bit.

* event: ```{name:"treble", value: treble value}```

### trebleDown([callback])

Decrease treble a bit.

* event: ```{name:"treble", value: treble value}```

### trebleMin([callback])

Set treble to minimum.

* event: ```{name:"treble", value: treble value}```

### trebleNeutral([callback])

Set treble to neutral.

* event: ```{name:"treble", value: treble value}```

### trebleMax([callback])

Set treble to maximum.

* event: ```{name:"treble", value: treble value}```

### balanceRight([callback])

Set balance a bit more to the right.

* event: ```{name:"balance", value: balance value}```

### balanceLeft([callback])

Set balance a bit more to the left.

* event: ```{name:"balance", value: balance value}```

### balanceLeftMax([callback])

Set balance fully left.

* event: ```{name:"balance", value: balance value}```

### balanceMiddle([callback])

Set balance in the middle.

* event: ```{name:"balance", value: balance value}```

### balanceRightMax([callback])

Set balance fully right.

* event: ```{name:"balance", value: balance value}```

### displayUpdateAuto([callback])

Set display update to auto.

* event: ```{name:"display_update", value: display_update value}```

### displayUpdateManual([callback])

Set display update to manual.

* event: ```{name:"display_update", value: display_update value}```

### getDisplay([callback])

Get what the display is currently showing.

* event: ```{name:"display", value: display value}```

### getDisplay1([callback])

Get line 1 of display.

* event: ```{name:"display1", value: display1 value}```

### getDisplay2([callback])

Get line 2 of the display.

* event: ```{name:"display2", value: display2 value}```

### getProductType([callback])

Get the product type.

* event: ```{name:"product_type", value: product_type value}```

### getProductVersion([callback])

Get the product version.

* event: ```{name:"product_version", value: product_version value}```

### getTcVersion([callback])

Get the TC version.

* event: ```{name:"tc_version", value: tc_version value}```

### getDisplaySize([callback])

Get the display size.

* event: ```{name:"display_size", value: display_size value}```

### getDisplayUpdate([callback])

Get the display update strategy.

* event: ```{name:"display_update", value: display_update value}```

### getCurrentPower([callback])

Get the power status.

* event: ```{name:"power", value: power value}```

### getCurrentSource([callback])

Get the selected source.

* event: ```{name:"source", value: source value}```

### getTone([callback])

Get the tone control status.

* event: ```{name:"tone", value: tone value}```

### getBass([callback])

Get the bass value.

* event: ```{name:"bass", value: bass value}```

### getTreble([callback])

Get the treble value.

* event: ```{name:"treble", value: treble value}```

### getBalance([callback])

Get the balance.

* event: ```{name:"balance", value: balance value}```

### getCurrentFrequency([callback])

Get the sampling frequency.

* event: ```{name:"freq", value: freq value}```

### getPlayStatus([callback])

Get the play status.

* event: ```{name:"play_status", value: play_status value}```

### getVolumeMax([callback])

Get the maximum volume.

* event: ```{name:"volume_max", value: volume_max value}```

### getVolumeMin([callback])

Get the minimum volume.

* event: ```{name:"volume_min", value: volume_min value}```

### getVolume([callback])

Get the volume.

* event: ```{name:"volume", value: volume value}```

### getToneMax([callback])

Get the maximum tone value.

* event: ```{name:"tone_max", value: tone_max value}```
