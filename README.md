# Control Rotel amplifiers with RS232 connection

So far, this library has been tested with

* Rotel RA-12 V02

http://bwgroupsupport.com/download/rs232 lists several other Rotel components with a RS232 interface,
so if you find that it works with, or you want to add support for, any of these devices, please let
me know.

## Usage

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
