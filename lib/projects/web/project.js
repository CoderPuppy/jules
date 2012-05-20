var n = require('natives');
var path = n.path;
var WebConfig = require(path.join(__dirname, 'config'));

var WebProject = module.exports = (function WebProjectClass() {
	function Project() {
		this.config = new WebConfig();
	}
	
	return Project;
})();
