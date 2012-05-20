var nStore = requre('nstore');

var open = exports.open = function open(options, cb) {
	if(typeof(options.file) !== 'string') throw new Error('No file option');
	
	var db = nStore.open(options.file, function() {
		cb(new DB(db));
	});
};

var DB = (function DBClass() {
	function DB(db) {
		this.__db = db;
	}
	
	DB.prototype.set = function set(key, value, cb) {
		if(!key) throw new Error('No key to store ' + value + ' in');
		
		this.__db.save(key, value, cb);
		
		return this;
	};
	
	DB.prototype.get = function get(key, cb) {
		if(!key) throw new Error('No key to get data from');
		
		this.__db.get(key, cb);
		
		return this;
	};
	
	DB.prototype.remove = function remove(key, cb) {
		if(!key) throw new Error('No key to remove');
		
		this.__db.remove(key, cb);
		
		return this;
	};
	
	DB.prototype.clear = function clear(cb) {
		this.__db.clear(cb);
		
		return this;
	};
	
	DB.prototype.has = function has(key, cb) {
		if(!key) throw new Error('No key to check existence of');
		
		this.get(key, function(error, value) {
			cb(error, !!value);
		});
		
		return this;
	};
	
	DB.prototype.length = function length(cb) {
		process.nextTick(function() {
			cb(this.__db.length);
		}.bind(this));
		
		return this;
	};
	
	return DB;
})();
