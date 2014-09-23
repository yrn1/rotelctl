var rotelctl = require('./lib/rotelctl');

var rctl = new rotelctl.RotelCtl('/dev/ttyUSB0');
rctl.open(function(err) {
  if (err) {
    return console.error(err);
  }
  rctl.getDisplay('get_display!', function(err, data) {
    if (err) {
      return console.error(err);
    }
    console.log('"' + data + '"');
    rctl.close(function(err) {
      if (err) {
        return console.error(err);
      }
    });
  });
});
