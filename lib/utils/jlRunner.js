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

exports.runFile = function runFile(file, sandbox) {
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
					runContext = extend(runContext, sandbox);
				}
				
				vm.runInNewContext(code, runContext);
			});
		} else {
			throw "File not found: " + path.resolve(process.cwd(), file);
		}
	});
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
		runContext = extend(runContext, sandbox);
	}
	
	vm.runInNewContext(fs.readFileSync(path), runContext);
	
	return fileExports;
}

exports.require = function require(file, sandbox) {
	var curPath
	
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
		
		throw "Could not find module: " + file;
	} else {
		return runRequirePath(curPath, sandbox);
	}
}

exports.run = function run(code, sandbox) {
	setTimeout(function() {
		var fileExports = {};
		
		var runContext = extend(copy(context), {
			"exports": fileExports,
			"module": {
				"exports": fileExports
			}
		});
		
		if(sandbox) {
			runContext = extend(runContext, sandbox);
		}
		
		vm.runInNewContext(code, runContext);
	}, 0);
}

context = {
	"process": process,
	"console": console,
	"require": exports.require,
	"global": global,
	"Class": Class
}
