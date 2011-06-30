task("run", [], function(args) {
	console.log('args: ', args);
	
	run('jules r', args, function(error, stdout, stderr) {
		console.log(arguments);	
	});
});
