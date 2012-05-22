var n = require('natives');
var path = n.path;
var Config = require(path.join(__dirname, '../config'));
var getSrc = Config.getSrc;

function projName(name) {
	return name.replace(/([a-z\d])([A-Z\d])g, '$1 $2').replace(/^[\w\d]/g, function($A) {
		return $A.toUpperCase();
	});
}

function loadRoutes(config, file) {
	getSrc(require.resolve(file), function(src) {
		var ctx = {};
		
		ctx[projName(config.project.name)] = config.project;
	});
}

var WebConfig = module.exports = (function WebConfigClass() {
	function WebConfig(project) {
		Config.call(this, project);
		
		this.routes = [];
	}
	util.inherits(WebConfig, Config);
	
	WebConfig.prototype.load = function load(base) {
		this.super_.load.call(this, base);
		
		// load the routes
		loadRoutes(this, path.resolve(base, "lib/config/routes"));
	};
	
	return WebConfig;
})();
