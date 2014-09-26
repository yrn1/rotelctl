"use strict";

var commands = require('./commands');

var responseMap = Object.keys(commands).map(function(command) {
  return commands[command];
}).reduce(function(acc, response) {
  acc[response.response] = {
    name: response.response,
    delimiter: response.delimiter,
    sized: response.sized};
  return acc;
}, {});

var responses = Object.keys(responseMap).map(function(name) {
  return responseMap[name];
});

responses.sort(function(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
});

exports.responses = responses;

var parse = function(current) {

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