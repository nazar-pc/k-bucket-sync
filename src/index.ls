/**
 * @package k-bucket-sync
 * @author  Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @license 0BSD
 */
function Wrapper (array-map-set)
	ArrayMap	= array-map-set['ArrayMap']
	ArraySet	= array-map-set['ArraySet']
	/**
	 * @constructor
	 *
	 * @param {!ArrayBufferView}	id			Own ID
	 * @param {number}				bucket_size	Size of a bucket from Kademlia design
	 *
	 * @return {!kBucketSync}
	 */
	!function k-bucket-sync (id, bucket_size)
		if !(@ instanceof k-bucket-sync)
			return new k-bucket-sync(id, bucket_size)

		@_id			= id
		@_bucket_size	= bucket_size
		@_node_data		= ArrayMap()
		@_root			= @_create_node()

	k-bucket-sync:: =
		/**
		 * @param {!ArrayBufferView}	id		Node ID
		 * @param {*}					data	Arbitrary data associated with node
		 * @param {Function=}			on_full Will be called if bucket where node need to be inserted is full with array of nodes in the bucket as an argument
		 *
		 * @return {boolean} `true` if node was added/updated or `false` otherwise
		 */
		set : (id, data = null, on_full = null) ->
			node		= @_root
			bit_index	= 0

			# Find place where to insert new contact
			while node.contacts == null
				node = @_determine_node(bit_index, id, node)
				bit_index++

			# If already there - move it to the most recently used and update data
			if @_node_data.has(id)
				node.contacts.delete(id)
				node.contacts.add(id)
				@_node_data.set(id, data)
				return true
			# If there is space for one more contacts - add
			else if node.contacts.size < @_bucket_size
				node.contacts.add(id)
				@_node_data.set(id, data)
				true
			# If time to split - split and try to add again
			else if node.splittable
				@_split_node_contacts(bit_index, node)
				@set(id, data, on_full)
			# Otherwise ignore
			else
				on_full?(Array.from(node.contacts))
				false
		/**
		 * @return {!Array<!ArrayBufferView>}
		 */
		get_all : ->
			@_get_node_contacts(@_root)
		/**
		 * @param {!Object} node
		 *
		 * @return {!Array<!Uint8Array>}
		 */
		_get_node_contacts : (node) ->
			if node.contacts
				Array.from(node.contacts)
			else
				@_get_node_contacts(node.left).concat(@_get_node_contacts(node.right))
		/**
		 * @param {!ArrayBufferView} id Node ID
		 *
		 * @return {*} Data associated with node it it exists or `null` otherwise
		 */
		get_data : (id) ->
			@_node_data.get(id) || null
		/**
		 * @return {number}
		 */
		count : ->
			@_node_data.size
		/**
		 * @param {!ArrayBufferView} id Node ID
		 */
		del : (id) !->
			if !@_node_data.has(id)
				return

			node		= @_root
			bit_index	= 0

			# Find place where to insert new contact
			while node.contacts == null
				node = @_determine_node(bit_index, id, node)
				bit_index++

			node.contacts.delete(id)
			@_node_data.delete(id)
		/**
		 * @param {!ArrayBufferView}	id		Node ID
		 * @param {number=}		number	How many results to return
		 *
		 * @return {!Array<!ArrayBufferView>} Array of node IDs closest to specified ID (`number` of nodes max)
		 */
		closest : (id, number = Infinity) ->
			Array.from(@_node_data.keys())
				.sort (a, b) ~>
					@_distance(a, id) - @_distance(b, id)
				.slice(0, number)
		/**
		 * @return {!Object}
		 */
		_create_node : ->
			{
				contacts	: ArraySet()
				splittable	: true
				left		: null
				right		: null
			}
		/**
		 * @param {!ArrayBufferView} id_1
		 * @param {!ArrayBufferView} id_2
		 *
		 * @return {number}
		 */
		_distance : (id_1, id_2) ->
			distance = 0
			for , index in id_1
				distance	= distance * 256 + (id_1[index] .^. id_2[index])
			distance
		/**
		 * @param {number}				bit_index
		 * @param {!ArrayBufferView}	id
		 * @param {!Object}				node
		 *
		 * @return {!Object}
		 */
		_determine_node : (bit_index, id, node) ->
			interested_byte	= ~~(bit_index / 8)
			bit				= bit_index % 8
			bit_set			= 2**(7 - bit)
			# Check if `bit` of interested byte of `id` is `1`
			if id[interested_byte] .&. bit_set
				node.right
			else
				node.left
		/**
		 * @param {number}	bit_index
		 * @param {!Object}	node
		 */
		_split_node_contacts : (bit_index, node) !->
			node.left	= @_create_node()
			node.right	= @_create_node()

			# Distribute the nodes between 2 new nodes
			node.contacts.forEach (id) !~>
				@_determine_node(bit_index, id, node).contacts.add(id)
			node.contacts	= null

			local_node		= @_determine_node(bit_index, @_id, node)
			# Don't allow split the part of the tree further from local node
			if local_node == node.left
				node.right.splittable	= false
			else
				node.left.splittable	= false

	Object.defineProperty(k-bucket-sync::, 'constructor', {value: k-bucket-sync})

	k-bucket-sync

if typeof define == 'function' && define['amd']
	# AMD
	define(['array-map-set'], Wrapper)
else if typeof exports == 'object'
	# CommonJS
	module.exports = Wrapper(require('array-map-set'))
else
	# Browser globals
	@'k_bucket_sync' = Wrapper(@'array_map_set')
