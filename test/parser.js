"use strict";

var parser = require('../lib/parser');
var assert = require('assert');

describe('parser', function() {
  describe('#responseDefs', function() {
    it('should be a deduplicated list of responseDefs', function() {
      assert.deepEqual(parser.responseDefs, [
        { "delimiters": ["="], "name": "balance", "sized": false },
        { "delimiters": ["="], "name": "bass", "sized": false },
        { "delimiters": ["="], "name": "display", "sized": true },
        { "delimiters": ["="], "name": "display1", "sized": true },
        { "delimiters": ["="], "name": "display2", "sized": true },
        { "delimiters": ["="], "name": "display_size", "sized": false },
        { "delimiters": ["="], "name": "display_update", "sized": false },
        { "delimiters": ["="], "name": "freq", "sized": false },
        { "delimiters": ["="], "name": "mute", "sized": false },
        { "delimiters": ["="], "name": "play_status", "sized": false },
        { "delimiters": ["_","="], "name": "power", "sized": false },
        { "delimiters": ["="], "name": "product_type", "sized": true },
        { "delimiters": ["="], "name": "product_version", "sized": true },
        { "delimiters": ["="], "name": "source", "sized": false },
        { "delimiters": ["="], "name": "tc_version", "sized": true },
        { "delimiters": ["="], "name": "tone", "sized": false },
        { "delimiters": ["="], "name": "tone_max", "sized": false },
        { "delimiters": ["="], "name": "treble", "sized": false },
        { "delimiters": ["="], "name": "volume", "sized": false },
        { "delimiters": ["="], "name": "volume_max", "sized": false },
        { "delimiters": ["="], "name": "volume_min", "sized": false }
      ]);
    });
  });
  describe('#parse', function() {
    it('should parse a sized response from exact buffer', function() {
      var result = parser.parse(new Buffer('display=029,this is the full display data'));
      assert.equal(result.responses.length, 1);
      assert.equal(result.responses[0].name, 'display');
      assert.equal(result.responses[0].value, 'this is the full display data');
      assert.equal(result.buffer.length, 0);
    });
    it('should leave a too small buffer with sized response alone', function() {
      var result = parser.parse(new Buffer('display=029,this is the full display dat'));
      assert.equal(result.responses.length, 0);
      assert.equal(result.buffer.length, 40);
    });
    it('should parse a sized response from a too large buffer', function() {
      var result = parser.parse(new Buffer('display=029,this is the full display datadada'));
      assert.equal(result.responses.length, 1);
      assert.equal(result.responses[0].name, 'display');
      assert.equal(result.responses[0].value, 'this is the full display data');
      assert.equal(result.buffer.length, 4);
    });
    it('should parse multiple sized responses', function() {
      var result = parser.parse(new Buffer('display=029,this is the full display dataproduct_version=06,V2.1.0'));
      assert.equal(result.responses.length, 2);
      assert.equal(result.responses[0].name, 'display');
      assert.equal(result.responses[0].value, 'this is the full display data');
      assert.equal(result.responses[1].name, 'product_version');
      assert.equal(result.responses[1].value, 'V2.1.0');
      assert.equal(result.buffer.length, 0);
    });
    it('should parse a delimited response from exact buffer', function() {
      var result = parser.parse(new Buffer('source=coax1!'));
      assert.equal(result.responses.length, 1);
      assert.equal(result.responses[0].name, 'source');
      assert.equal(result.responses[0].value, 'coax1');
      assert.equal(result.buffer.length, 0);
    });
    it('should parse a delimited response with non-standard delimiter from exact buffer', function() {
      var result = parser.parse(new Buffer('power_on!'));
      assert.equal(result.responses.length, 1);
      assert.equal(result.responses[0].name, 'power');
      assert.equal(result.responses[0].value, 'on');
      assert.equal(result.buffer.length, 0);
    });
    it('should leave a too small buffer with delimited response alone', function() {
      var result = parser.parse(new Buffer('source=coax1'));
      assert.equal(result.responses.length, 0);
      assert.equal(result.buffer.length, 12);
    });
    it('should parse a delimited response from a too large buffer', function() {
      var result = parser.parse(new Buffer('source=coax1!dada'));
      assert.equal(result.responses.length, 1);
      assert.equal(result.responses[0].name, 'source');
      assert.equal(result.responses[0].value, 'coax1');
      assert.equal(result.buffer.length, 4);
    });
    it('should parse multiple delimited responses', function() {
      var result = parser.parse(new Buffer('source=coax1!volume=45!'));
      assert.equal(result.responses.length, 2);
      assert.equal(result.responses[0].name, 'source');
      assert.equal(result.responses[0].value, 'coax1');
      assert.equal(result.responses[1].name, 'volume');
      assert.equal(result.responses[1].value, '45');
      assert.equal(result.buffer.length, 0);
    });
    it('should parse a delimited unknown response from exact buffer', function() {
      var result = parser.parse(new Buffer('foobar=baz!'));
      assert.equal(result.responses.length, 1);
      assert.equal(result.responses[0].name, 'foobar');
      assert.equal(result.responses[0].value, 'baz');
      assert.equal(result.buffer.length, 0);
    });
    it('should parse mixed responses', function() {
      var result = parser.parse(new Buffer('display=029,this is the full display datafoobar=baz!power_on!blahblah!product_version=06,V2.1.0crap'));
      assert.equal(result.responses.length, 5);
      assert.equal(result.responses[0].name, 'display');
      assert.equal(result.responses[0].value, 'this is the full display data');
      assert.equal(result.responses[1].name, 'foobar');
      assert.equal(result.responses[1].value, 'baz');
      assert.equal(result.responses[2].name, 'power');
      assert.equal(result.responses[2].value, 'on');
      assert.equal(result.responses[3].name, 'blahblah');
      assert.equal(result.responses[3].value, '');
      assert.equal(result.responses[4].name, 'product_version');
      assert.equal(result.responses[4].value, 'V2.1.0');
      assert.equal(result.buffer.length, 4);
    });
  });
});