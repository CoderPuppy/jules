var Server = require('./server').Server;
var s = new Server(function(env) {
	return {
		status: 404,
		headers: {},
		body: "404 Page not found: " + env.url.pathname + '\nenv: ' + sys.inspect(env)
	};
}, function(env, e) {
	return {
		status: 500,
		headers: {},
		body: '500: ' + sys.inspect(e, true, null)
	};
});

s.start();
