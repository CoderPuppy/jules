var n = require('natives');
var path = n.path;
var fs = n.fs;
var vm = n.vm;

function loadNPMFile(config, file) {
	getSrc(require.resolve(file), function(src) {
		var deps = [];
		
		vm.runInNewContext(src, {
			dep: function dep(name, options) {
				if(typeof(name) === 'string') {
					// should properly parse it to use git and svn and such
					name = {
						type: 'npm',
						name: name.split('@')[0],
						version: name.split('@')[1] || '*'
					};
				}
				
				deps.push({
					name: name,
					options: options
				});
			}
		});
		
		config.deps = config.deps.concat(deps);
	});
}

function getSrc(file, cb) {
	var ext = path.extname(file) || '.js',
		module = {
			exports: {},
			_compile: function(src, filename) {
				cb(src);
				
				return {};
			}
		};
	
	require.extensions[ext](module, file);
}

var Config = module.exports = (function ConfigClass() {
	function Config(project) {
		this.project = project;
		this.deps = [];
	}
	
	Config.getSrc = getSrc;
	
	Config.prototype.load = function load() {
		loadNPMFile(this, path.resolve(this.project.base, 'NPMFile'));
	};
	
	return Config;
})();
