"use strict";
var rotelctl = require('../lib/rotelctl');
var assert = require('assert');
var sinon = require('sinon');

describe('rotelctl', function() {
  describe('RotelCtl', function() {
    var rctl;
    beforeEach(function() {
      rctl = new rotelctl.RotelCtl('/dev/foobar');
      rctl.sp = {
        write: sinon.stub()
      };
    });
    describe('command with sized response', function() {
      it('should callback with error on send error', function(done) {
        rctl.sp.write.yields('ERR');
        rctl.getDisplay(function(err) {
          assert.equal(err, 'ERR');
          done();
        });
      });
      it('should emit error on send error', function(done) {
        rctl.sp.write.yields('ERR');
        rctl.on('error', function(err) {
          assert.equal(err, 'ERR');
          done();
        });
        rctl.getDisplay();
      });
      it('should callback when response received at once', function(done) {
        rctl.getDisplay(function(err, data) {
          assert.ifError(err);
          assert.equal(data, 'this is the full display data');
          done();
        });
        rctl._receive(Buffer.from('display=029,this is the full display data'));
      });
      it('should emit when response received at once', function(done) {
        rctl.on('data', function(data) {
          assert.deepEqual(data, {name: 'display', value: 'this is the full display data'});
          done();
        });
        rctl.getDisplay();
        rctl._receive(Buffer.from('display=029,this is the full display data'));
      });
      it('should callback when response received in pieces', function(done) {
        rctl.getDisplay(function(err, data) {
          assert.ifError(err);
          assert.equal(data, 'this is the full display data');
          done();
        });
        rctl._receive(Buffer.from('display=029,th'));
        rctl._receive(Buffer.from('i'));
        rctl._receive(Buffer.from('s '));
        rctl._receive(Buffer.from('is the full display dat'));
        rctl._receive(Buffer.from('a'));
      });
      it('should emit when response received in pieces', function(done) {
        rctl.on('data', function(data) {
          assert.deepEqual(data, {name: 'display', value: 'this is the full display data'});
          done();
        });
        rctl.getDisplay();
        rctl._receive(Buffer.from('display=029,th'));
        rctl._receive(Buffer.from('i'));
        rctl._receive(Buffer.from('s '));
        rctl._receive(Buffer.from('is the full display dat'));
        rctl._receive(Buffer.from('a'));
      });
      it('should callback when response received in different pieces', function(done) {
        rctl.getDisplay(function(err, data) {
          assert.ifError(err);
          assert.equal(data, 'this is the full display data');
          done();
        });
        rctl._receive(Buffer.from('displ'));
        rctl._receive(Buffer.from('ay=02'));
        rctl._receive(Buffer.from('9,th'));
        rctl._receive(Buffer.from('i'));
        rctl._receive(Buffer.from('s '));
        rctl._receive(Buffer.from('is the full display dat'));
        rctl._receive(Buffer.from('a'));
      });
      it('should emit when response received in different pieces', function(done) {
        rctl.on('data', function(data) {
          assert.deepEqual(data, {name: 'display', value: 'this is the full display data'});
          done();
        });
        rctl.getDisplay();
        rctl._receive(Buffer.from('displ'));
        rctl._receive(Buffer.from('ay=02'));
        rctl._receive(Buffer.from('9,th'));
        rctl._receive(Buffer.from('i'));
        rctl._receive(Buffer.from('s '));
        rctl._receive(Buffer.from('is the full display dat'));
        rctl._receive(Buffer.from('a'));
      });
      it('should callback for multiple calls when responseDefs received at once', function(done) {
        var res1 = null;
        var res2 = null;
        var checkResults = function() {
          if (res1 && res2) {
            assert.equal(res1, 'this is the full display data');
            assert.equal(res2, 'and this is another response');
            done();
          }
        };
        rctl.getDisplay(function(err, data) {
          assert.ifError(err);
          res1 = data;
          checkResults();
        });
        rctl.getDisplay(function(err, data) {
          assert.ifError(err);
          res2 = data;
          checkResults();
        });
        rctl._receive(Buffer.from('display=029,this is the full display datadisplay=028,and this is another response'));
      });
      it('should emit for multiple calls when responseDefs received at once', function(done) {
        var res = [];
        var checkResults = function() {
          if (res.length === 2) {
            assert.deepEqual(res[0], {name: 'display', value: 'this is the full display data'});
            assert.deepEqual(res[1], {name: 'display', value: 'and this is another response'});
            done();
          }
        };
        rctl.on('data', function(data) {
          res.push(data);
          checkResults();
        });
        rctl.getDisplay();
        rctl.getDisplay();
        rctl._receive(Buffer.from('display=029,this is the full display datadisplay=028,and this is another response'));
      });
    });

    describe('command with delimited response', function() {
      it('should callback with error on send error', function(done) {
        rctl.sp.write.yields('ERR');
        rctl.getDisplaySize(function(err) {
          assert.equal(err, 'ERR');
          done();
        });
      });
      it('should emit error on send error', function(done) {
        rctl.sp.write.yields('ERR');
        rctl.on('error', function(err) {
          assert.equal(err, 'ERR');
          done();
        });
        rctl.getDisplaySize();
      });
      it('should callback when response received at once', function(done) {
        rctl.getDisplaySize(function(err, data) {
          assert.ifError(err);
          assert.equal(data, '20,02');
          done();
        });
        rctl._receive(Buffer.from('display_size=20,02!'));
      });
      it('should emit when response received at once', function(done) {
        rctl.on('data', function(data) {
          assert.deepEqual(data, {name: 'display_size', value: '20,02'});
          done();
        });
        rctl.getDisplaySize();
        rctl._receive(Buffer.from('display_size=20,02!'));
      });
      it('should callback when response received in pieces', function(done) {
        rctl.getDisplaySize(function(err, data) {
          assert.ifError(err);
          assert.equal(data, '20,02');
          done();
        });
        rctl._receive(Buffer.from('display_size=20,'));
        rctl._receive(Buffer.from('0'));
        rctl._receive(Buffer.from('2!'));
      });
      it('should emit when response received in pieces', function(done) {
        rctl.on('data', function(data) {
          assert.deepEqual(data, {name: 'display_size', value: '20,02'});
          done();
        });
        rctl.getDisplaySize();
        rctl._receive(Buffer.from('display_size=20,'));
        rctl._receive(Buffer.from('0'));
        rctl._receive(Buffer.from('2!'));
      });
      it('should callback when response received in different pieces', function(done) {
        rctl.getDisplaySize(function(err, data) {
          assert.ifError(err);
          assert.equal(data, '20,02');
          done();
        });
        rctl._receive(Buffer.from('displ'));
        rctl._receive(Buffer.from('ay_size='));
        rctl._receive(Buffer.from('2'));
        rctl._receive(Buffer.from('0'));
        rctl._receive(Buffer.from(','));
        rctl._receive(Buffer.from('02'));
        rctl._receive(Buffer.from('!'));
      });
      it('should emit when response received in different pieces', function(done) {
        rctl.on('data', function(data) {
          assert.deepEqual(data, {name: 'display_size', value: '20,02'});
          done();
        });
        rctl.getDisplaySize();
        rctl._receive(Buffer.from('displ'));
        rctl._receive(Buffer.from('ay_size='));
        rctl._receive(Buffer.from('2'));
        rctl._receive(Buffer.from('0'));
        rctl._receive(Buffer.from(','));
        rctl._receive(Buffer.from('02'));
        rctl._receive(Buffer.from('!'));
      });
      it('should callback for multiple calls when responseDefs received at once', function(done) {
        var res1 = null;
        var res2 = null;
        var checkResults = function() {
          if (res1 && res2) {
            assert.equal(res1, '20,02');
            assert.equal(res2, 'a whole lot of crap');
            done();
          }
        };
        rctl.getDisplaySize(function(err, data) {
          assert.ifError(err);
          res1 = data;
          checkResults();
        });
        rctl.getDisplaySize(function(err, data) {
          assert.ifError(err);
          res2 = data;
          checkResults();
        });
        rctl._receive(Buffer.from('display_size=20,02!display_size=a whole lot of crap!'));
      });
      it('should emit for multiple calls when responseDefs received at once', function(done) {
        var res = [];
        var checkResults = function() {
          if (res.length === 2) {
            assert.deepEqual(res[0], {name: 'display_size', value: '20,02'});
            assert.deepEqual(res[1], {name: 'display_size', value: 'a whole lot of crap'});
            done();
          }
        };
        rctl.on('data', function(data) {
          res.push(data);
          checkResults();
        });
        rctl.getDisplaySize();
        rctl.getDisplaySize();
        rctl._receive(Buffer.from('display_size=20,02!display_size=a whole lot of crap!'));
      });
    });
    describe('mixed commands', function() {
      it('should emit and callback', function(done) {
        var res = [];
        var checkResults = function() {
          if (res.length === 5) {
            assert.deepEqual(res[0], {name: 'display', value: 'this is the full display data'});
            assert.deepEqual(res[1], {name: 'foobar', value: 'baz'});
            assert.deepEqual(res[2], {name: 'power', value: 'on'});
            assert.deepEqual(res[3], {name: 'blahblah', value: ''});
            assert.deepEqual(res[4], {name: 'product_version', value: 'V2.1.0'});
            done();
          }
        };
        rctl.on('data', function(data) {
          res.push(data);
          checkResults();
        });
        rctl.getDisplay(function(err, data) {
          assert.ifError(err);
          assert.equal(data, 'this is the full display data');
        });
        rctl.powerOn();
        rctl.getProductVersion(function(err, data) {
          assert.ifError(err);
          assert.equal(data, 'V2.1.0');
        });
        rctl._receive(Buffer.from('display=029,this is the full display datafoobar=baz!power_on!blahblah!product_version=06,V2.1.0crap'));
      });
    });
  });
});
