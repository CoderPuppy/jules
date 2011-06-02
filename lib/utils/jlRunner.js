String.prototype.jStringEscape = function() {
	return this.replace(/("|')/g, "\$1");
}

var path      = require('path'),
		fs        = require('fs'),
		class     = require('../class'),
		Class     = class.Class,
		vm        = require('vm'),
		copy      = function copy(obj) {
			var copyed;
			
			if(Object.prototype.toString.call(obj) == '[object Array]') {
				copyed = {};
				
				for(key in obj) {
					copyed[key] = obj[key];
				}
			} else if(Object.prototype.toString.call(obj) == '[object Array]') {
				copyed = [];
				
				for(var i = 0; i < copyed.length; i++) {
					copyed[i] = obj[i];
				}
			}
			
			return copyed || obj;
		},
		context,
		extend = function extend(obj, extender) {
			for(key in extender) {
				obj[key] = extender[key];
			}
			
			return obj;
		};

exports.runFile = function runFile(file, args) {
	path.exists(path.resolve(process.cwd(), file), function(exists) {
		if(exists) {
			fs.readFile(path.resolve(process.cwd(), file), function(err, code) {
				var code = code.toString();
				var fileExports = {};
				vm.runInNewContext(code, extend(copy(context), {
					"exports": fileExports,
					"module": {
						"exports": fileExports
					}
				}));
			});
		} else {
			throw "File not found: " + path.resolve(process.cwd(), file);
		}
	});
}

exports.require = function require(file) {
	path.exists(path.resolve(process.cwd(), file) + '.jl', function(exists) {
		if(!exists) {
			throw "File not found: " + path.resolve(process.cwd(), file);
		}
	});
	
	var fileExports = {};
	
	vm.runInNewContext(fs.readFileSync(path.resolve(process.cwd(), file + '.jl')), extend(copy(context), {
		"exports": fileExports,
		"module": {
			"exports": fileExports
		},
		"global": global
	}))
	
	return fileExports;
}

exports.run = function run(code) {
	setTimeout(function() {
		vm.runInNewContext(code, copy(context));
	}, 0);
}

context = {
	"process": process,
	"console": console,
	"require": exports.require,
	"global": global,
	"Class": Class
}
