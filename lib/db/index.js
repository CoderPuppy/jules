var getDB = module.exports = function getDB(name) {
	return require(path.join(__dirname, 'stores', name));
};

/** API
  *	open(options, onOpen) => DB
  *	
  *	DB =>
  *		has(key, cb(error, boolean)) => DB
  *		get(key, cb(error, *)) => DB
  *		set(key, value, cb(error)) => DB
  *		remove(key, cb(error)) => DB
  *		clear(cb(error)) => DB
  *		length(cb(error, number)) => DB
  */
