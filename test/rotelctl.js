"use strict";
var rotelctl = require('../lib/rotelctl');
var assert = require('assert');
var sinon = require('sinon');

describe.skip('rotelctl', function() {
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
      it('should callback when response received at once', function(done) {
        rctl.getDisplay(function(err, data) {
          assert.ifError(err);
          assert.equal(data, 'this is the full display data');
          done();
        });
        rctl.receive(new Buffer('display=029,this is the full display data'));
      });
      it('should callback when response received in pieces', function(done) {
        rctl.getDisplay(function(err, data) {
          assert.ifError(err);
          assert.equal(data, 'this is the full display data');
          done();
        });
        rctl.receive(new Buffer('display=029,th'));
        rctl.receive(new Buffer('i'));
        rctl.receive(new Buffer('s '));
        rctl.receive(new Buffer('is the full display dat'));
        rctl.receive(new Buffer('a'));
      });
      it('should callback when response received in different pieces', function(done) {
        rctl.getDisplay(function(err, data) {
          assert.ifError(err);
          assert.equal(data, 'this is the full display data');
          done();
        });
        rctl.receive(new Buffer('displ'));
        rctl.receive(new Buffer('ay=02'));
        rctl.receive(new Buffer('9,th'));
        rctl.receive(new Buffer('i'));
        rctl.receive(new Buffer('s '));
        rctl.receive(new Buffer('is the full display dat'));
        rctl.receive(new Buffer('a'));
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
        rctl.receive(new Buffer('display=029,this is the full display datadisplay=028,and this is another response'));
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
      it('should callback when response received at once', function(done) {
        rctl.getDisplaySize(function(err, data) {
          assert.ifError(err);
          assert.equal(data, '20,02');
          done();
        });
        rctl.receive(new Buffer('display_size=20,02!'));
      });
      it('should callback when response received in pieces', function(done) {
        rctl.getDisplaySize(function(err, data) {
          assert.ifError(err);
          assert.equal(data, '20,02');
          done();
        });
        rctl.receive(new Buffer('display_size=20,'));
        rctl.receive(new Buffer('0'));
        rctl.receive(new Buffer('2!'));
      });
      it('should callback when response received in different pieces', function(done) {
        rctl.getDisplaySize(function(err, data) {
          assert.ifError(err);
          assert.equal(data, '20,02');
          done();
        });
        rctl.receive(new Buffer('displ'));
        rctl.receive(new Buffer('ay_size='));
        rctl.receive(new Buffer('2'));
        rctl.receive(new Buffer('0'));
        rctl.receive(new Buffer(','));
        rctl.receive(new Buffer('02'));
        rctl.receive(new Buffer('!'));
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
        rctl.receive(new Buffer('display_size=20,02!display_size=a whole lot of crap!'));
      });
    });
  });
});
