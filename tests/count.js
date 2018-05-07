var crypto  = require('crypto');
var test    = require('tape');
var KBucket = require('..');

test('count returns 0 when no contacts in bucket', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket.count(), 0);
	t.end();
});

test('count returns 1 when 1 contact in bucket', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	var contact = Buffer.from('a');
	kBucket.set(contact);
	t.same(kBucket.count(), 1);
	t.end();
});

test('count returns 1 when same contact added to bucket twice', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	var contact = Buffer.from('a');
	kBucket.set(contact);
	kBucket.set(contact);
	t.same(kBucket.count(), 1);
	t.end();
});

test('count returns number of added unique contacts', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	kBucket.set(Buffer.from('a'));
	kBucket.set(Buffer.from('a'));
	kBucket.set(Buffer.from('b'));
	kBucket.set(Buffer.from('b'));
	kBucket.set(Buffer.from('c'));
	kBucket.set(Buffer.from('d'));
	kBucket.set(Buffer.from('c'));
	kBucket.set(Buffer.from('d'));
	kBucket.set(Buffer.from('e'));
	kBucket.set(Buffer.from('f'));
	t.same(kBucket.count(), 6);
	t.end();
});
