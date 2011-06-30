var path         = require('path'),
		env_starter  = require(path.resolve(__dirname, "../../../projects/web/env_starter"));

String.prototype.trim = function() {
	return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

exports.run = function(args) {
	var env  = "dev",
			port = 3001;
	
	var s = env_starter.start({
		port: port,
		env: env
	});
	
	process.on("SIGINT", function() {
		s.stop();
		process.exit();
	});
	
	process.stdin.on("data", function(d) {
		switch((d + "").trim()) {
			case "r":
				s.refresh();
				break;
			case "e":
				s.stop();
				process.exit();
				break;
		}
	}).resume();
}
