var n = require('natives');
var path = n.path;
var createProject = require(path.join(__dirname, '../createProject'));

var add = module.exports = function(celeri) {
	celeri.option({
		command: 'new :name OR new',
		description: 'Create a new project',
		optional: {
		    
		}
	}, function(data, next) {
		var to = data.name || '.';
		
		console.log('create:', to);
		
		createProject(to, 'web', function() {
			console.log('created');
			
			next();
		});
	});
};
