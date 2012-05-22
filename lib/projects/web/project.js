var n = require('natives');
var path = n.path;
var util = n.util;
var WebConfig = require(path.resolve(__dirname, 'config'));
var Project = require(path.resolve(__dirname, '../project'));

var WebProject = module.exports = (function WebProjectClass() {
	function WebProject(name) {
		Project.call(this, name);
		
		this.config = new WebConfig(this);
	}
	util.inherits(WebProject, Project);
	
	return WebProject;
})();
