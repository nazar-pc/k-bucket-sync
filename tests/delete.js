var test    = require('tape');
var KBucket = require('..');

test('deleting a contact should delete contact from nested buckets', function (t) {
	var kBucket = new KBucket(Buffer.from([0x00, 0x00]), 20);
	for (var i = 0; i < kBucket._bucket_size; ++i) {
		kBucket.set(Buffer.from([0x80, i])); // make sure all go into "far away" bucket
	}
	// cause a split to happen
	kBucket.set(Buffer.from([0x00, i]));
	// console.log(require('util').inspect(kBucket, false, null))
	var contactToDelete = Buffer.from([0x80, 0x00]);
	t.same(Array.from(kBucket._root.right.contacts)[0], contactToDelete);
	kBucket.del(Buffer.from([0x80, 0x00]));
	t.notOk(kBucket._root.right.contacts.has(contactToDelete));
	t.end();
});
