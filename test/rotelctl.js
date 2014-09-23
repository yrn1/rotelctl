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
    describe('getDisplay', function() {
      it('should callback with error on send error', function(done) {
        rctl.sp.write.yields('ERR');
        rctl.getDisplay('get_display!', function(err) {
          assert.equal(err, 'ERR');
          done();
        });
      });
      it('should callback when response received at once', function(done) {
        rctl.getDisplay('get_display!', function(err, data) {
          assert.ifError(err);
          assert.equal(data, 'this is the full display data');
          done();
        });
        rctl.receive(new Buffer('display=029,this is the full display data'));
      });
      it('should callback when response received in pieces', function(done) {
        rctl.getDisplay('get_display!', function(err, data) {
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
        rctl.getDisplay('get_display!', function(err, data) {
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
      it('should callback for multiple calls when responses received at once', function(done) {
        var res1 = null;
        var res2 = null;
        var checkResults = function() {
          if (res1 && res2) {
            assert.equal(res1, 'this is the full display data');
            assert.equal(res2, 'and this is another response');
            done();
          }
        };
        rctl.getDisplay('get_display!', function(err, data) {
          assert.ifError(err);
          res1 = data;
          checkResults();
        });
        rctl.getDisplay('get_display!', function(err, data) {
          assert.ifError(err);
          res2 = data;
          checkResults();
        });
        rctl.receive(new Buffer('display=029,this is the full display datadisplay=028,and this is another response'));
      });
    });
  });
});
