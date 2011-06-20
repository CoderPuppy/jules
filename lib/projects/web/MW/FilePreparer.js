var path = require('path'),
		fs   = require('fs'),
		MW   = require(path.resolve(__dirname, 'MW')).MW;

exports.MW = MW.subClass(function(app) {
	this.app = app;
}, {
	run: function(env) {
		var urlPaths = [],
				dir      = "";
		
		if(env.url.pathname == '/') {
			dir = path.resolve(process.cwd(), 'public');
			urlPaths.push('index.htm');
			urlPaths.push('index.html');
		} else {
			var filePath = path.resolve(process.cwd(), 'public', '.' + env.url.pathname);
			
			dir = path.dirname(filePath);
			
			var exists = path.existsSync(filePath);
			if(exists) {
				var stat = fs.statSync(filePath);
				
				if(stat.isDirectory()) {
					urlPaths.push(path.resolve(env.url.pathname, 'index.htm'));
					urlPaths.push(env.url.pathname + '/index.html');
				} else if(stat.isFile()) {
					urlPaths.push(env.url.pathname);
				}
			}
			
			urlPaths.push(env.url.pathname);
		}
		
		env.jules.paths = urlPaths;
		env.jules.dir   = dir;
		
		return this.app.run(env);
	}
});
