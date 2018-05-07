var crypto  = require('crypto');
var test    = require('tape');
var KBucket = require('..');

var LEFT_NODE  = 0;
var RIGHT_NODE = 1;
var ROOT_NODE  = {left : LEFT_NODE, right : RIGHT_NODE};

test('id 00000000, bitIndex 0, should be low', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket._determine_node(0, Buffer.from([0x00]), ROOT_NODE), LEFT_NODE);
	t.end();
});

test('id 01000000, bitIndex 0, should be low', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket._determine_node(0, Buffer.from([0x40]), ROOT_NODE), LEFT_NODE);
	t.end();
});

test('id 01000000, bitIndex 1, should be high', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket._determine_node(1, Buffer.from([0x40]), ROOT_NODE), RIGHT_NODE);
	t.end();
});

test('id 01000000, bitIndex 2, should be low', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket._determine_node(2, Buffer.from([0x40]), ROOT_NODE), LEFT_NODE);
	t.end();
});

test('id 01000000, bitIndex 9, should be low', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket._determine_node(9, Buffer.from([0x40]), ROOT_NODE), LEFT_NODE);
	t.end();
});

test('id 01000001, bitIndex 7, should be high', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket._determine_node(7, Buffer.from([0x41]), ROOT_NODE), RIGHT_NODE);
	t.end();
});

test('id 0100000100000000, bitIndex 7, should be high', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket._determine_node(7, Buffer.from([0x41, 0x00]), ROOT_NODE), RIGHT_NODE);
	t.end();
});

test('id 000000000100000100000000, bitIndex 15, should be high', function (t) {
	var kBucket = new KBucket(crypto.randomBytes(20), 20);
	t.same(kBucket._determine_node(15, Buffer.from([0x00, 0x41, 0x00]), ROOT_NODE), RIGHT_NODE);
	t.end();
});
