var crypto      = require('crypto');
var test        = require('tape');
var KBucketSync = require('..');

test('adding a contact places it in root node', function (t) {
	var kBucket = new KBucketSync(crypto.randomBytes(20), 20);
	var contact = Buffer.from('a');
	kBucket.set(contact);
	t.same(Array.from(kBucket._root.contacts.values()), [contact]);
	t.end();
});

test('adding an existing contact does not increase number of contacts in root node', function (t) {
	var kBucket = new KBucketSync(crypto.randomBytes(20), 20);
	var contact = Buffer.from('a');
	kBucket.set(contact);
	kBucket.set(Buffer.from('a'));
	t.equal(kBucket._root.contacts.size, 1);
	t.end();
});

test('adding same contact moves it to the end of the root node (most-recently-contacted end)', function (t) {
	var kBucket = new KBucketSync(crypto.randomBytes(20), 20);
	var contact = Buffer.from('a');
	kBucket.set(contact);
	t.same(kBucket._root.contacts.size, 1);
	kBucket.set(Buffer.from('b'));
	t.same(kBucket._root.contacts.size, 2);
	t.same(Array.from(kBucket._root.contacts)[0], contact); // least-recently-contacted end
	kBucket.set(contact);
	t.same(kBucket._root.contacts.size, 2);
	t.same(Array.from(kBucket._root.contacts)[1], contact); // most-recently-contacted end
	t.end();
});

test('adding contact to bucket that can\'t be split results in calling "on_full" callback', function (t) {
	t.plan(21);
	var kBucket = new KBucketSync(Buffer.from([0x00, 0x00]), 20);
	for (var j = 0; j < kBucket._bucket_size + 1; ++j) {
		kBucket.set(Buffer.from([0x80, j]), null, function (contacts) { // make sure all go into "far away" node
			t.same(contacts.length, 20);
			// console.dir(kBucket._root.right.contacts[0])
			for (var i = 0; i < contacts.length; ++i) {
				// the least recently contacted end of the node should be pinged
				t.true(contacts[i] === Array.from(kBucket._root.right.contacts)[i]);
			}
			t.end();
		});
	}
});

test('should return "true" on success', function (t) {
	t.plan(2);
	var kBucket = new KBucketSync(crypto.randomBytes(20), 20);
	var contact = Buffer.from('a');
	t.ok(kBucket.set(contact));
	t.ok(kBucket.set(contact));
	t.end();
});

test('should return "true" on success when adding to a split node', function (t) {
	t.plan(2);
	var kBucket = new KBucketSync(
		Buffer.from(''), // need non-random localNodeId for deterministic splits
		20
	);
	for (var i = 0; i < kBucket._bucket_size + 1; ++i) {
		kBucket.set(Buffer.from('' + i));
	}
	t.same(kBucket._root.contacts, null);
	var contact = Buffer.from('a');
	t.ok(kBucket.set(contact));
	t.end();
});
