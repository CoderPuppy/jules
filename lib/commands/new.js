var add = module.exports = function(celeri) {
	celeri.option({
		command: 'new :name',
		description: 'Create a new project',
		optional: {
		    
		}
	}, function(data, next) {
		console.log(data);
		console.log(fn.toString());
		
		next();
	});
};
