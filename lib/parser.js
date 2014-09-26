"use strict";

var debug = require('debug')('rotelctl:parser');
var commands = require('./commands');

var responseDefMap = Object.keys(commands).map(function(command) {
  return commands[command];
}).reduce(function(acc, response) {
  if (response.delimiter && response.delimiter.length !== 1) {
    throw new Error('Delimiters should be a single character');
  }
  if (acc[response.response]) {
    if (acc[response.response].delimiters.indexOf(response.delimiter || '=') < 0) {
      acc[response.response].delimiters.push(response.delimiter || '=');
    }
    if (acc[response.response].sized !== (response.sized || false)) {
      throw new Error('Responses with same name cannot be both sized and delimited');
    }
  } else {
    acc[response.response] = {
      name: response.response,
      delimiters: [response.delimiter || '='],
      sized: response.sized || false};
  }
  return acc;
}, {});

var responseDefs = Object.keys(responseDefMap).map(function(name) {
  return responseDefMap[name];
});

responseDefs.sort(function(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
});

exports.responseDefs = responseDefs;

var getResponseDefFromNameWithDelimiter = function(str) {
  var filtered = responseDefs.filter(function(responseDef) {
    return responseDef.delimiters.some(function(delimiter) {
      return str === responseDef.name + delimiter;
    });
  });
  if (filtered.length > 0) {
    return filtered[0];
  }
  return null;
};

var detectResponseDefAtHeadOfBuffer = function(buffer) {
  var str = '';
  var i;
  var responseDef = null;
  for (i = 0; i < buffer.length; i++) {
    str += String.fromCharCode(buffer[i]);
    responseDef = getResponseDefFromNameWithDelimiter(str);
    if (responseDef !== null) {
      debug('responseDef at head of buffer: ' + responseDef.name);
      return responseDef;
    }
  }
  return null;
};

var getUnknownResponseAtHeadOfBuffer = function(buffer) {
  var responseName = '';
  var responseMsg = '';
  var i;
  for (i = 0;
       i < buffer.length &&
         String.fromCharCode(buffer[i]) !== '=' &&
         String.fromCharCode(buffer[i]) !== '!';
       i++) {
    responseName += String.fromCharCode(buffer[i]); // TODO special chars
  }
  if (String.fromCharCode(buffer[i]) === '=') {
    debug('unknown parse responseName: "' + responseName + '"');
    for (i = i + 1; i < buffer.length && String.fromCharCode(buffer[i]) !== '!'; i++) {
      responseMsg += String.fromCharCode(buffer[i]); // TODO special chars
    }
  }
  if (String.fromCharCode(buffer[i]) === '!') {
    debug('unknown parse responseMsg: "' + responseMsg + '"');
    return {
      response: {name: responseName, value: responseMsg},
      buffer: buffer.slice(i + 1)
    };
  }
  return null;
};

var getSizedResponseAtHeadOfBuffer = function(responseDef, buffer) {
  var sizeString = '';
  var i;
  for (i = responseDef.name.length + 1;
       i < buffer.length && String.fromCharCode(buffer[i]) !== ',';
       i++) {
    sizeString += String.fromCharCode(buffer[i]);
    debug('sized parse sizeString: "' + sizeString + '"');
  }
  if (String.fromCharCode(buffer[i]) === ',') {
    var size = parseInt(sizeString, 10);
    debug('size parse size: ' + size);
    if (i + 1 + size <= buffer.length) {
      var responseMsg = buffer.slice(i + 1, i + 1 + size).toString(); // TODO special chars
      debug('size parse responseMsg: "' + responseMsg + '"');
      return {
        response: {name: responseDef.name, value: responseMsg},
        buffer: buffer.slice(i + 1 + size)
      };
    }
  }
  return null;
};

var getDelimitedResponseAtHeadOfBuffer = function(responseDef, buffer) {
  var responseMsg = '';
  var i;
  for (i = responseDef.name.length + 1;
       i < buffer.length && String.fromCharCode(buffer[i]) !== '!';
       i++) {
    responseMsg += String.fromCharCode(buffer[i]); // TODO special chars
  }
  if (String.fromCharCode(buffer[i]) === '!') {
    debug('delimited parse responseMsg: "' + responseMsg + '"');
    return {
      response: {name: responseDef.name, value: responseMsg},
      buffer: buffer.slice(i + 1)
    };
  }
  return null;
};

var recurseParse = function(parseResult, currentResult) {
  if (parseResult === null) {
    return currentResult;
  }
  return parse({
    responses: currentResult.responses.concat(parseResult.response),
    buffer: parseResult.buffer
  });
};

var parse = function(currentResult) {
  debug('parsing buffer: "' + currentResult.buffer + '"');
  var responseDef = detectResponseDefAtHeadOfBuffer(currentResult.buffer);
  if (responseDef === null) {
    return recurseParse(
      getUnknownResponseAtHeadOfBuffer(currentResult.buffer),
      currentResult);
  }
  if (responseDef.sized) {
    return recurseParse(
      getSizedResponseAtHeadOfBuffer(responseDef, currentResult.buffer),
      currentResult);
  }
  return recurseParse(
    getDelimitedResponseAtHeadOfBuffer(responseDef, currentResult.buffer),
    currentResult);
};

/**
 * Tries to parse one or more response from a given buffer.
 * Return an map as follows:
 * {
 *   responses: [
 *     { name: <name of response>, value: <value> },
 *     { name: <name of response>, value: <value> },
 *     ...
 *   ],
 *   buffer: <new buffer with parsed commands sliced off>
 * }
 * If the buffer does not yet contain a complete response, then
 * the list of responses is empty and the returned buffer is
 * the original one.
 */
exports.parse = function(buffer) {
  return parse({responses: [], buffer: buffer});
};