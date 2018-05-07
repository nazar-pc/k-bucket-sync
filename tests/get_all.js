var crypto  = require('crypto');
var test    = require('tape');
var KBucket = require('..');

test('get_all should return empty array if no contacts', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket.get_all().length, 0);
	t.end();
});

test('get_all should return all contacts in an array arranged from low to high buckets', function (t) {
	t.plan(22);
	var kBucket     = new KBucket(Buffer.from([0x00, 0x00]), 20);
	var expectedIds = [];
	for (var i = 0; i < kBucket._bucket_size; ++i) {
		kBucket.set(Buffer.from([0x80, i])); // make sure all go into "far away" bucket
		expectedIds.push(0x80 * 256 + i);
	}
	// cause a split to happen
	kBucket.set(Buffer.from([0x00, 0x80, i - 1]));
	// console.log(require('util').inspect(kBucket, {depth: null}))
	var contacts = kBucket.get_all();
	// console.log(require('util').inspect(contacts, {depth: null}))
	t.same(contacts.length, kBucket._bucket_size + 1);
	t.same(parseInt(contacts[0].toString('hex'), 16), 0x80 * 256 + i - 1);
	contacts.shift(); // get rid of low bucket contact
	for (i = 0; i < kBucket._bucket_size; ++i) {
		t.same(parseInt(contacts[i].toString('hex'), 16), expectedIds[i]);
	}
	t.end();
});
