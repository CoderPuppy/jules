var n = require('natives');
var path = n.path;
var createProject = require(path.join(__dirname, '../createProject'));

/*var add = module.exports = function(celeri) {
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
};*/

var add = module.exports = function add(program) {
	program.command('new [name]')
		.description('Create a new project')
		.option('-t, --type <type>', 'Type of project to create', 'web')
		.action(function(name, options) {
			var to = path.resolve(process.cwd(), name || '.');
			
			createProject(to, options.type, function() {
				console.log('created');
			});
		});
};
