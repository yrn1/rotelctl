var RotelCtl = require('./lib/rotelctl').RotelCtl;
var rctl = new RotelCtl('/dev/ttyUSB0');

rctl.on('open', function() {
  console.log('open');
  var disp=rctl.getDisplay();
  console.log(disp);
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
