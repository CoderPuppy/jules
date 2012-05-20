var n = require('natives');
var path = n.path;
var fs = n.fs;
var templating = require(path.join(__dirname, 'templating'));

function copy(from, to, options) {
	options = options || {};
	
	var deps = 0;
	
	function depDone() {
		if(!--deps) {
			if(typeof(options.cb) === 'function') options.cb();
		}
	}
	
	function doIt() {
		fs.readdir(from, function(e, files) {
			if(e) throw e;
		
			files.forEach(function(name) {
				fs.stat(path.join(from, name), function(e, stat) {
					if(stat.isDirectory()) {
						deps++;
						
						copy(path.join(from, name), path.join(to, name), {
							templating: options.templating,
							cb: depDone
						});
					} else if(stat.isFile()) {
						deps++;
						
						fs.readFile(path.join(from, name), function(e, d) {
							if(e) throw e;
						
							if(options.templating) d = templating.template(d.toString(), options.templating.obj);
						
							fs.writeFile(path.join(to, name), d, function(e) {
								if(e) throw e;
							
								depDone();
							});
						});
					}
				});
			});
		});
	}
	
	if(fs.exists(to)) { // should also stat it and check if it's a directory
		doIt();
	} else {
		fs.mkdir(to, function(e) {
			if(e) throw e;
			
			doIt();
		});
	}
}

var createProject = module.exports = function createProject(where, type, cb) {
	where = path.join(process.cwd(), where);
	
	var projectName = path.basename(where);
	
	copy(path.join(__dirname, 'projects', 'tmpl'), where, {
		templating: {
			obj: {
				name: projectName
			}
		}
	});
	copy(path.join(__dirname, 'projects', type, 'tmpl'), where, {
		templating: {
			obj: {
				name: projectName
			}
		},
		cb: cb
	});
};
