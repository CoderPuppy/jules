var path     = require('path'),
		fs       = require('fs'),
		http     = require('http'),
		https    = require('https'),
		jlRunner = require(path.resolve(__dirname, '../../../utils/', 'jlRunner'));

function log() {
	console.log.apply(console, arguments);
	return arguments.length > 0 ? (arguments.length > 1 ? arguments : arguments[0]) : null;
}

function switchToMainDir() {
	while(!path.existsSync(path.resolve(process.cwd(), 'project.json'))) {
		process.chdir('../');
	}
}

exports.run = function run(args) {
	switchToMainDir();
	
	var context ,
			app     = new http.Server(),
			env     = "dev";
	
	for(var i = 0; i < args.length; i++) {
		switch(args[i]) {
			case "-e":
				if(args.length > i)
					env = args[++i];
				else
					console.log('no env')
				break;
			default:
				env = args[i];
				break;
		}
	}
	
	console.log('env: ', env);
	
	switch(env) {
		case "production":
			env = "pro";
			break;
		case "development":
		case "devel":
			env = "dev";
			break;
	}
	
	// Run config/env.jl
	
	context = {
		"ENV_VARS": process.env,
		"app": app,
		"env": env
	};
	
	jlRunner.runFileSync(path.resolve(process.cwd(), 'config', 'env.jl'), context);
	
	if(context.env) {
		env = context.env;
	}
	
	context = {
		"app": app
	};
	
	jlRunner.runFileSync(path.resolve(process.cwd(), 'config/envs', env + '.jl'), context);
}
