var n = require('natives');
var path = n.path;
var Config = require(path.join(__dirname, 'config'));

var Project = module.exports = (function ProjectClass() {
	function Project(base) {
		this.base = base;
		this.config = new Config(this);
	}
	
	return Project;
})();
