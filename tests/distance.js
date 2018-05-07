var crypto  = require('crypto');
var test    = require('tape');
var KBucket = require('..');

var bucket = new KBucket(crypto.randomBytes(20), 20);

test('distance between 00000000 and 00000000 is 00000000', function (t) {
	t.same(bucket._distance(Buffer.from([0x00]), Buffer.from([0x00])), 0);
	t.end();
});

test('distance between 00000000 and 00000001 is 00000001', function (t) {
	t.same(bucket._distance(Buffer.from([0x00]), Buffer.from([0x01])), 1);
	t.end();
});

test('distance between 00000010 and 00000001 is 00000011', function (t) {
	t.same(bucket._distance(Buffer.from([0x02]), Buffer.from([0x01])), 3);
	t.end();
});

test('distance between 0000000100100100 and 0100000000100100 is 0100000100000000', function (t) {
	t.same(bucket._distance(Buffer.from([0x01, 0x24]), Buffer.from([0x40, 0x24])), 16640);
	t.end();
});