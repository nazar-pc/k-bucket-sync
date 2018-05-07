var crypto  = require('crypto');
var test    = require('tape');
var KBucket = require('..');

test('get retrieves null if no contacts', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket.get_data(Buffer.from('foo')), null);
	t.end();
});

test('get_data retrieves a contact that was added', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	var contact = Buffer.from('a');
	kBucket.set(contact, contact);
	t.equal(kBucket.get_data(contact), contact);
	t.end();
});

test('get retrieves most recently added contact if same id', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	var contact = Buffer.from('a');
	kBucket.set(contact, 'foo');
	kBucket.set(contact, 'bar');
	t.same(kBucket.get_data(Buffer.from('a')), 'bar');
	t.end();
});

test('get retrieves contact from nested leaf node', function (t) {
	var kBucket = new KBucket(Buffer.from([0x00, 0x00]), 20);
	for (var i = 0; i < kBucket._bucket_size; ++i) {
		kBucket.set(Buffer.from([0x80, i])); // make sure all go into "far away" bucket
	}
	// cause a split to happen
	kBucket.set(Buffer.from([0x00, i]), 'me');
	t.same(kBucket.get_data(Buffer.from([0x00, i])), 'me');
	t.end();
});
