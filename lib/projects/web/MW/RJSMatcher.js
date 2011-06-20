var path     = require('path'),
		fs       = require('fs'),
		RJS      = require(path.resolve(__dirname, '../utils', 'RJS')),
		MW       = require(path.resolve(__dirname, 'MW')).MW;

function renderRJS(loc, env, config) {
	return RJS.render(fs.readFileSync(path.resolve(process.cwd(), env.jules.dir, loc)) + '', env, config);
	
	return {
		status : 200,
		headers: {"Content-Type": "text/javascript"},
		body   : "RJS: " + loc
	};
}

exports.MW = MW.subClass(function(config) {
	console.log('config: ', config)
	
	return function RJSM(app) {
		return {
			run: function(env) {
				if(/\.js$/.test(env.url.pathname) && fs.readdirSync(env.jules.dir).indexOf(path.basename(env.url.pathname, '.js') + '.rjs')) {
					return renderRJS(path.basename(env.url.pathname, '.js') + '.rjs', env, config);
				} else if(/\.rjs$/.test(env.url.pathname) && fs.readdirSync(env.jules.dir).indexOf(path.basename(env.url.pathname, '.rjs') + '.rjs')) {
					return renderRJS(path.basename(env.url.pathname, '.rjs') + '.rjs', env, config);
				}
				
				return app.run(env);
			}
		};
	};
});
