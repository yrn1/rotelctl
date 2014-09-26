"use strict";

var parser = require('../lib/parser');
var assert = require('assert');

describe('parser', function() {
  describe('#responses', function() {
    it('should be a deduplicated list of responses', function() {
      assert.equal(parser.responses, [
        {"name":"balance","delimiter":"=","sized":false},
        {"name":"bass","delimiter":"=","sized":false}
      ]);
    });
  });
});