var crypto  = require('crypto');
var test    = require('tape');
var KBucket = require('..');

test('closest nodes are returned', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	for (var i = 0; i < 0x12; ++i) {
		kBucket.set(Buffer.from([i]));
	}
	var contact  = Buffer.from([0x15]); // 00010101
	var contacts = kBucket.closest(contact, 3);
	t.same(contacts.length, 3);
	t.same(contacts[0], Buffer.from([0x11])); // distance: 00000100
	t.same(contacts[1], Buffer.from([0x10])); // distance: 00000101
	t.same(contacts[2], Buffer.from([0x05])); // distance: 00010000
	t.end();
});

test('n is Infinity by default', function (t) {
	var kBucket = new KBucket(Buffer.from([0x00, 0x00]), 20);
	for (var i = 0; i < 1e3; ++i) {
		kBucket.set(Buffer.from([~~(i / 256), i % 256]));
	}
	t.true(kBucket.closest(Buffer.from([0x80, 0x80])).length > 100);
	t.end();
});

test('closest nodes are returned (including exact match)', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	for (var i = 0; i < 0x12; ++i) {
		kBucket.set(Buffer.from([i]));
	}
	var contact  = Buffer.from([0x11]); // 00010001
	var contacts = kBucket.closest(contact, 3);
	t.same(contacts[0], Buffer.from([0x11])); // distance: 00000000
	t.same(contacts[1], Buffer.from([0x10])); // distance: 00000001
	t.same(contacts[2], Buffer.from([0x01])); // distance: 00010000
	t.end();
});

test('closest nodes are returned even if there isn\'t enough in one bucket', function (t) {
	var kBucket = new KBucket(Buffer.from([0x00, 0x00]), 20);
	for (var i = 0; i < kBucket._bucket_size; i++) {
		kBucket.set(Buffer.from([0x80, i]));
		kBucket.set(Buffer.from([0x01, i]));
	}
	kBucket.set(Buffer.from([0x00, 0x01]));
	var contact  = Buffer.from([0x00, 0x03]); // 0000000000000011
	var contacts = kBucket.closest(contact, 22);
	t.same(contacts[0], Buffer.from([0x00, 0x01])); // distance: 0000000000000010
	t.same(contacts[1], Buffer.from([0x01, 0x03])); // distance: 0000000100000000
	t.same(contacts[2], Buffer.from([0x01, 0x02])); // distance: 0000000100000010
	t.same(contacts[3], Buffer.from([0x01, 0x01]));
	t.same(contacts[4], Buffer.from([0x01, 0x00]));
	t.same(contacts[5], Buffer.from([0x01, 0x07]));
	t.same(contacts[6], Buffer.from([0x01, 0x06]));
	t.same(contacts[7], Buffer.from([0x01, 0x05]));
	t.same(contacts[8], Buffer.from([0x01, 0x04]));
	t.same(contacts[9], Buffer.from([0x01, 0x0b]));
	t.same(contacts[10], Buffer.from([0x01, 0x0a]));
	t.same(contacts[11], Buffer.from([0x01, 0x09]));
	t.same(contacts[12], Buffer.from([0x01, 0x08]));
	t.same(contacts[13], Buffer.from([0x01, 0x0f]));
	t.same(contacts[14], Buffer.from([0x01, 0x0e]));
	t.same(contacts[15], Buffer.from([0x01, 0x0d]));
	t.same(contacts[16], Buffer.from([0x01, 0x0c]));
	t.same(contacts[17], Buffer.from([0x01, 0x13]));
	t.same(contacts[18], Buffer.from([0x01, 0x12]));
	t.same(contacts[19], Buffer.from([0x01, 0x11]));
	t.same(contacts[20], Buffer.from([0x01, 0x10]));
	t.same(contacts[21], Buffer.from([0x80, 0x03])); // distance: 1000000000000000
	// console.log(require('util').inspect(kBucket, false, null))
	t.end();
});
