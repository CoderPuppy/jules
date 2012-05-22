var n = require('natives');
var path = n.path;
var fs = n.fs;
var templating = require(path.resolve(__dirname, 'templating'));

function copy(from, to, options) {
	options = options || {};
	
	var deps = 1;
	
	function depDone() {
		deps--;
		
//		try{throw new Error}catch(e){console.log('depDone: %s, %s', deps, e.stack);}
		
		if(!deps) {
			if(typeof(options.cb) === 'function') options.cb();
		}
	}
	
	function doIt() {
		fs.readdir(from, function(e, files) {
			if(e) throw e;
			
			files.forEach(function(name) {
				deps++;
				
				fs.stat(path.join(from, name), function(e, stat) {
					if(stat.isDirectory()) {
						copy(path.resolve(from, name), path.resolve(to, name), {
							templating: options.templating,
							cb: depDone
						});
					} else if(stat.isFile()) {
						fs.readFile(path.resolve(from, name), function(e, d) {
							if(e) throw e;
						
							if(options.templating) d = templating.template(d.toString(), options.templating.obj);
						
							fs.writeFile(path.resolve(to, name), d, function(e) {
								if(e) throw e;
							
								depDone();
							});
						});
					} else {
						depDone();
					}
				});
			});
			
			depDone();
		});
	}
	
	function createIt() {
		fs.mkdir(to, function(e) {
			if(e) throw e;
	
			doIt();
		});
	}
	
	path.exists(to, function(exists) {
		if(exists) {
			fs.stat(to, function(e, stat) {
				if(e) throw e;
			
				if(stat.isDirectory()) {
					doIt();
				} else {
					throw new Error('There is already a file at: ' + to);
				}
			});
		} else {
			createIt();
		}
	});
}

var createProject = module.exports = function createProject(where, type, cb) {
	where = path.resolve(process.cwd(), where);
	
	var projectName = path.basename(where);
	
	copy(path.resolve(__dirname, 'projects', 'tmpl'), where, {
		templating: {
			obj: {
				name: projectName
			}
		},
		cb: function() {	
			copy(path.resolve(__dirname, 'projects', type, 'tmpl'), where, {
				templating: {
					obj: {
						name: projectName
					}
				},
				cb: cb
			});
		}
	});
};
