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
		},
		color = require(path.resolve(__dirname, 'color')).set;

exports.checkPaths = [];

exports.runFile = function runFile(file, sandbox, callback) {
	path.exists(path.resolve(process.cwd(), file), function(exists) {
		if(exists) {
			fs.readFile(path.resolve(process.cwd(), file), function(err, code) {
				var code = code.toString();
				var fileExports = {};
				var runContext = extend(copy(context), {
					"exports": fileExports,
					"module": {
						"exports": fileExports
					}
				});
							
				if(sandbox) {
					var tmp = extend(runContext, sandbox);
					
					runContext = extend(sandbox, tmp);
				}
				
				vm.runInNewContext(code, runContext);
				
				callback(runContext);
			});
		} else {
			console.error('not found')
			throw "File not found: " + path.resolve(process.cwd(), file);
		}
	});
}

exports.runFileSync = function runFile(file, sandbox) {
	if(path.existsSync(path.resolve(process.cwd(), file))) {
		var code = fs.readFileSync(path.resolve(process.cwd(), file)) + '';
		var fileExports = {};
		var runContext = extend(copy(context), {
			"exports": fileExports,
			"module": {
				"exports": fileExports
			}
		});
		
				
		if(sandbox) {
			var tmp = extend(runContext, sandbox);
			
			runContext = extend(sandbox, tmp);
		}
		
		vm.runInNewContext(code, runContext);
	} else {
		throw "File not found: " + path.resolve(process.cwd(), file);
	}
}

function runRequirePath(path, sandbox) {
	var fileExports = {};
	
	var runContext = extend(copy(context), {
		"exports": fileExports,
		"module": {
			"exports": fileExports
		}
	});
	
	if(sandbox) {
		//var tmp = extend(runContext, sandbox);
		
		runContext = extend(sandbox, /*tmp*/runContext);
	}
	
	vm.runInNewContext(fs.readFileSync(path), runContext);
	
	return fileExports;
}

function globalRequire() {return require.apply(null, arguments);}

exports.require = function require(file, sandbox) {
	var curPath;
	
	if(!path.existsSync(curPath = (path.resolve(process.cwd(), file) + '.jl'))) { // Check the path		
		var envPath = process.env.PATH.split(':');
		
		for(var i = 0; i < envPath.length; i++) {
			if(!path.existsSync(curPath = (path.resolve(envPath[i], file) + '.jl'))) { // Check the path
				continue;
			} else {
				return runRequirePath(curPath, sandbox);
			}
		}
		
		if(process.env.NODE_PATH) {
			var envPath = process.env.NODE_PATH.split(':');
			
			for(var i = 0; i < envPath.length; i++) {
				if(!path.existsSync(curPath = (path.resolve(envPath[i], file) + '.jl'))) { // Check the path
					continue;
				} else {
					return runRequirePath(curPath, sandbox);
				}
			}
		}
		
		for(var i = 0; i < exports.checkPaths.length; i++) {
			if(!path.existsSync(curPath = (path.resolve(exports.checkPaths[i], file) + '.jl'))) { // Check the path
				continue;
			} else {
				return runRequirePath(curPath, sandbox);
			}
		}
		
		try {
			return globalRequire(file);
		} catch(e) {
			throw "Could not find module: " + file;
		}
		
		throw "Could not find module: " + file;
	} else {
		return runRequirePath(curPath, sandbox);
	}
}

exports.run = function run(code, sandbox, cb) {	
	setTimeout(function() {
		var fileExports = {};
		
		var runContext = extend(copy(context), {
			"exports": fileExports,
			"module": {
				"exports": fileExports
			}
		});
		
		if(sandbox) {
			runContext = extend(sandbox, runContext);
		}
		
		var rtn = vm.runInNewContext(code, runContext);
		
		if(cb) {cb(rtn);}
	}, 0);
}

exports.runSync = function run(code, sandbox) {
	var fileExports = {};
	
	var runContext = extend(copy(context), {
		"exports": fileExports,
		"module": {
			"exports": fileExports
		}
	});
	
	if(sandbox) {
		runContext = extend(sandbox, runContext);
	}
	
	return vm.runInNewContext(code, runContext);
}

context = {
	"process": process,
	"console": {
		"error": function error() {
			console.error.apply(console, Array.prototype.map.call(arguments, function(text) {return color(text, 'red');}));
			
			return arguments.length > 0 ? (arguments.length > 1 ? arguments : arguments[0]) : null;
		},
		"log": function log() {
			console.log.apply(console, arguments);
			
			return arguments.length > 0 ? (arguments.length > 1 ? arguments : arguments[0]) : null;
		},
		"warn": function warn() {
			console.log.apply(console, Array.prototype.map.call(arguments, function(text) {return color(text, 'yellow');}));
			
			return arguments.length > 0 ? (arguments.length > 1 ? arguments : arguments[0]) : null;
		}
	},
	"require": exports.require,
	"global": global,
	"Class": Class
}
