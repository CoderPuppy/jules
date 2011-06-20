var path = require('path'),
		fs   = require('fs'),
		MW   = require(path.resolve(__dirname, 'MW')).MW;

exports.MW = MW.subClass(function SM(app) {
	this.app = app;
}, {
	run: function(env) {
		var paths   = env.jules.paths,
				dir     = env.jules.dir,
				curPath;
		
		for(var i = 0; i < paths.length; i++) {
			if(path.existsSync(curPath = path.resolve(dir, '.' + paths[i]))) {				
				return {
					status: 200,
					headers: {},
					body: fs.readFileSync(curPath) + ''
				};
			}
		}
		
		return this.app.run(env);
	}
});
