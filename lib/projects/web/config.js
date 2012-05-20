var n = require('natives');
var path = n.path;
var Config = require(path.join(__dirname, '../config'));

var WebConfig = module.exports = (function WebConfigClass() {
	function WebConfig() {
		Config.call(this);
		
		this.routes = [];
	}
	util.inherits(WebConfig, Config);
	
	return WebConfig;
})();
