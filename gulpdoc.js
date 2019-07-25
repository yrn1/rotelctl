var through = require('through2');
var PluginError = require('plugin-error');
var File = require('vinyl');

module.exports = function(commandFile, opt) {
  function concat(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    if (file.isStream()) {
      return callback(new PluginError('gulpdoc', 'doesn\'t support Streams'));
    }

    var contents = file.contents.toString();
    var lines = [contents];

    var commands = require(commandFile);
    Object.keys(commands).forEach(function(command) {
      var name = command;
      var commandInfo = commands[command];
      if (commandInfo.param) {
        lines.push('### ' + name + '(' + commandInfo.param + ', [callback])');
      } else {
        lines.push('### ' + name + '([callback])');
      }
      lines.push('');
      if (commandInfo.doc.match(/\.$/)) {
        lines.push(commandInfo.doc);
      } else {
        lines.push(commandInfo.doc +'.');
      }
      lines.push('');
      lines.push('* event: ```{name:"' + commandInfo.response + '", value: ' + commandInfo.response + ' value}```');
      lines.push('');
    });

    file = new File({
      cwd: file.cwd,
      base: file.base,
      path: file.base +'/README.md',
      contents: Buffer.from(lines.join('\n'))
    });
    return callback(null, file);
  }

  return through.obj(concat);
};