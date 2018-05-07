var crypto  = require('crypto');
var test    = require('tape');
var KBucket = require('..');

test('adding a contact does not split node', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	kBucket.set(Buffer.from('a'));
	t.same(kBucket._root.left, null);
	t.same(kBucket._root.right, null);
	t.notSame(kBucket._root.contacts, null);
	t.end();
});

test('adding maximum number of contacts (per node) [20] into node does not split node', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	for (var i = 0; i < kBucket._bucket_size; ++i) {
		kBucket.set(Buffer.from('' + i));
	}
	t.same(kBucket._root.left, null);
	t.same(kBucket._root.right, null);
	t.notSame(kBucket._root.contacts, null);
	t.end();
});

test('adding maximum number of contacts (per node) + 1 [21] into node splits the node', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	for (var i = 0; i < kBucket._bucket_size + 1; ++i) {
		kBucket.set(Buffer.from('' + i));
	}
	t.notSame(kBucket._root.left, null);
	t.notSame(kBucket._root.right, null);
	t.same(kBucket._root.contacts, null);
	t.end();
});

test('split nodes contain all added contacts', function (t) {
	t.plan(20 /* _bucket_size */ + 2);
	var kBucket      = new KBucket(Buffer.from([0x00]), 20);
	var foundContact = {};
	for (var i = 0; i < kBucket._bucket_size + 1; ++i) {
		kBucket.set(Buffer.from([i]));
		foundContact[i] = false;
	}
	var traverse = function (node) {
		if (node.contacts === null) {
			traverse(node.left);
			traverse(node.right);
		} else {
			node.contacts.forEach(function (contact) {
				foundContact[parseInt(contact.toString('hex'), 16)] = true;
			});
		}
	};
	traverse(kBucket._root);
	Object.keys(foundContact).forEach(function (key) {
		t.true(foundContact[key], key);
	});
	t.same(kBucket._root.contacts, null);
	t.end();
});

test('when splitting nodes the "far away" node should be marked to prevent splitting "far away" node', function (t) {
	t.plan(5);
	var kBucket = new KBucket(Buffer.from([0x00]), 20);
	for (var i = 0; i < kBucket._bucket_size + 1; ++i) {
		kBucket.set(Buffer.from([i]));
	}
	// above algorithm will split left node 4 times and put 0x00 through 0x0f
	// in the left node, and put 0x10 through 0x14 in right node
	// since localNodeId is 0x00, we expect every right node to be "far" and
	// therefore marked as "splittable = false"
	// there will be one "left" node and four "right" nodes (t.expect(5))
	var traverse = function (node, splittable) {
		if (node.contacts === null) {
			traverse(node.left, true);
			traverse(node.right, false);
		} else {
			if (splittable) {
				t.true(node.splittable);
			} else {
				t.false(node.splittable);
			}
		}
	};
	traverse(kBucket._root);
	t.end();
});
