var crypto      = require('crypto');
var test        = require('tape');
var KBucketSync = require('..');

test('check if k-bucket has node', function (t) {
	var kBucket = new KBucketSync(crypto.randomBytes(20), 20);
	var contact = Buffer.from('a');
	kBucket.set(contact);
	t.ok(kBucket.has(contact));
	t.notOk(kBucket.has(Buffer.from('b')));
	t.end();
});
