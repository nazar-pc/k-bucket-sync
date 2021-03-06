// Generated by LiveScript 1.5.0
/**
 * @package k-bucket-sync
 * @author  Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @license 0BSD
 */
(function(){
  function Wrapper(arrayMapSet){
    var ArrayMap, ArraySet;
    ArrayMap = arrayMapSet['ArrayMap'];
    ArraySet = arrayMapSet['ArraySet'];
    /**
     * @constructor
     *
     * @param {!ArrayBufferView}	id			Own ID
     * @param {number}				bucket_size	Size of a bucket from Kademlia design
     *
     * @return {!kBucketSync}
     */
    function kBucketSync(id, bucket_size){
      if (!(this instanceof kBucketSync)) {
        return new kBucketSync(id, bucket_size);
      }
      this._id = id;
      this._bucket_size = bucket_size;
      this._node_data = ArrayMap();
      this._root = this._create_node();
    }
    kBucketSync.prototype = {
      /**
       * @param {!ArrayBufferView}	id		Node ID
       * @param {*}					data	Arbitrary data associated with node
       * @param {Function=}			on_full Will be called if bucket where node need to be inserted is full with array of nodes in the bucket as an argument
       *
       * @return {boolean} `true` if node was added/updated or `false` otherwise
       */
      'set': function(id, data, on_full){
        var node, bit_index;
        data == null && (data = null);
        on_full == null && (on_full = null);
        node = this._root;
        bit_index = 0;
        while (node.contacts === null) {
          node = this._determine_node(bit_index, id, node);
          bit_index++;
        }
        if (this._node_data.has(id)) {
          node.contacts['delete'](id);
          node.contacts.add(id);
          this._node_data.set(id, data);
          return true;
        } else if (node.contacts.size < this._bucket_size) {
          node.contacts.add(id);
          this._node_data.set(id, data);
          return true;
        } else if (node.splittable) {
          this._split_node_contacts(bit_index, node);
          return this.set(id, data, on_full);
        } else {
          if (typeof on_full == 'function') {
            on_full(Array.from(node.contacts));
          }
          return false;
        }
      }
      /**
       * @return {!Array<!ArrayBufferView>}
       */,
      'get_all': function(){
        return this._get_node_contacts(this._root);
      }
      /**
       * @param {!Object} node
       *
       * @return {!Array<!Uint8Array>}
       */,
      _get_node_contacts: function(node){
        if (node.contacts) {
          return Array.from(node.contacts);
        } else {
          return this._get_node_contacts(node.left).concat(this._get_node_contacts(node.right));
        }
      }
      /**
       * @param {!ArrayBufferView} id Node ID
       *
       * @return {*} Data associated with node it it exists or `null` otherwise
       */,
      'get_data': function(id){
        return this._node_data.get(id) || null;
      }
      /**
       * @param {!ArrayBufferView} id Node ID
       *
       * @return {boolean} Whether `id` node exists in k-bucket
       */,
      'has': function(id){
        return this._node_data.has(id);
      }
      /**
       * @return {number}
       */,
      'count': function(){
        return this._node_data.size;
      }
      /**
       * @param {!ArrayBufferView} id Node ID
       */,
      'del': function(id){
        var node, bit_index;
        if (!this._node_data.has(id)) {
          return;
        }
        node = this._root;
        bit_index = 0;
        while (node.contacts === null) {
          node = this._determine_node(bit_index, id, node);
          bit_index++;
        }
        node.contacts['delete'](id);
        this._node_data['delete'](id);
      }
      /**
       * @param {!ArrayBufferView}	id		Node ID
       * @param {number=}		number	How many results to return
       *
       * @return {!Array<!ArrayBufferView>} Array of node IDs closest to specified ID (`number` of nodes max)
       */,
      'closest': function(id, number){
        var contacts, nodes_to_check, bit_index, node, closer_node, this$ = this;
        number == null && (number = Infinity);
        if (this._node_data.size <= number) {
          contacts = Array.from(this._node_data.keys());
        } else {
          contacts = [];
          nodes_to_check = [this._root];
          bit_index = 0;
          while (nodes_to_check.length > 0 && contacts.length < number) {
            node = nodes_to_check.pop();
            if (node.contacts === null) {
              closer_node = this._determine_node(bit_index, id, node);
              bit_index++;
              if (closer_node === node.left) {
                nodes_to_check.push(node.right, node.left);
              } else {
                nodes_to_check.push(node.left, node.right);
              }
            } else {
              contacts = contacts.concat(Array.from(node.contacts));
            }
          }
        }
        return contacts.map(function(a){
          return [this$._distance(a, id), a];
        }).sort(function(a, b){
          return a[0] - b[0];
        }).slice(0, number).map(function(a){
          return a[1];
        });
      }
      /**
       * @return {!Object}
       */,
      _create_node: function(){
        return {
          contacts: ArraySet(),
          splittable: true,
          left: null,
          right: null
        };
      }
      /**
       * @param {!ArrayBufferView} id_1
       * @param {!ArrayBufferView} id_2
       *
       * @return {number}
       */,
      _distance: function(id_1, id_2){
        var distance, i$, len$, index;
        distance = 0;
        for (i$ = 0, len$ = id_1.length; i$ < len$; ++i$) {
          index = i$;
          distance = distance * 256 + (id_1[index] ^ id_2[index]);
        }
        return distance;
      }
      /**
       * @param {number}				bit_index
       * @param {!ArrayBufferView}	id
       * @param {!Object}				node
       *
       * @return {!Object}
       */,
      _determine_node: function(bit_index, id, node){
        var interested_byte, bit, bit_set;
        interested_byte = ~~(bit_index / 8);
        bit = bit_index % 8;
        bit_set = Math.pow(2, 7 - bit);
        if (id[interested_byte] & bit_set) {
          return node.right;
        } else {
          return node.left;
        }
      }
      /**
       * @param {number}	bit_index
       * @param {!Object}	node
       */,
      _split_node_contacts: function(bit_index, node){
        var local_node, this$ = this;
        node.left = this._create_node();
        node.right = this._create_node();
        node.contacts.forEach(function(id){
          this$._determine_node(bit_index, id, node).contacts.add(id);
        });
        node.contacts = null;
        local_node = this._determine_node(bit_index, this._id, node);
        if (local_node === node.left) {
          node.right.splittable = false;
        } else {
          node.left.splittable = false;
        }
      }
    };
    Object.defineProperty(kBucketSync.prototype, 'constructor', {
      value: kBucketSync
    });
    return kBucketSync;
  }
  if (typeof define === 'function' && define['amd']) {
    define(['array-map-set'], Wrapper);
  } else if (typeof exports === 'object') {
    module.exports = Wrapper(require('array-map-set'));
  } else {
    this['k_bucket_sync'] = Wrapper(this['array_map_set']);
  }
}).call(this);
