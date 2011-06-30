var path          = require('path'),
		fs            = require('fs'),
		http          = require('http'),
		https         = require('https'),
		jlRunner      = require(path.resolve(__dirname, '../../../utils/', 'jlRunner')),
		color         = require(path.resolve(__dirname, '../../../utils/', 'color')).set,
		WebAppConfig  = require(path.resolve(__dirname, '../../../projects/web/', 'run_config')).Config,
		Constants     = require(path.resolve(__dirname, '../../../projects/web/', 'constants')),
		WebApp        = require(path.resolve(__dirname, '../../../projects/web/', 'app')).WebApp,
		funcUtils     = require(path.resolve(__dirname, '../../../utils/', 'funcUtils'))/*,
		RemoteRouter  = require(path.resolve(__dirname, '../../../projects/web/utils/', 'routing_remote')).Router*/,
		ProjectConfig = require(path.resolve(__dirname, '../../../ProjectConfig')).ProjectConfig
		GlobalContext = require(path.resolve(__dirname, '../../../projects/web/GlobalConfig')).GlobalConfig,
		RemoteENV     = require(path.resolve(__dirname, "../../../projects/web/remote/env")).RemoteENV,
		RemoteRouter  = require(path.resolve(__dirname, "../../../projects/web/remote/router")).RemoteRouter,
		RemoteConfig  = require(path.resolve(__dirname, "../../../projects/web/remote/config")).RemoteConfig;

function log() {
	console.log.apply(console, arguments);
	return arguments.length > 0 ? (arguments.length > 1 ? arguments : arguments[0]) : null;
}

function switchToMainDir() {
	while(!path.existsSync(path.resolve(process.cwd(), 'project.json'))) {
		process.chdir('../');
		if(process.cwd() == '/') {
			console.error(color("None of the current directory or it's parents is a project", 'red'));
			process.exit(1);
			break;
		}
	}
}

exports.run = function run(args) {
	var	projConfig = new ProjectConfig(),
			app/*        = new WebApp(routes, projConfig)*/,
			eType      = "e",
			eData      = "dev",
			nce        = false,
			ce         = false,
			end        = function(){}, 
			env        = "dev";
	
	for(var i = 0; i < args.length; i++) {
		switch(args[i]) {
			case "-e":
			case "--env":
			case "--enviroment":
				if(args.length > i) {
					eType = "e";
					eData = args[++i];
					nce   = false;
					env   = args[i];
				} else
					console.error(color("No Environment specified", "red"));
				break;
			case "-nce":
			case "--no-central-enviroment":
				nce = true;
				break;
			case "-ce":
			case "--central-enviorment":
				nce   = false;
				eType = "f";
				ce    = true;
			case "-ef":
			case "--enviroment-file":
				if(args.length > i) {
					nce   = false;
					eType = "f";
					eData = args[++i];
				} else
					console.error(color("No Environment File specified", "red"));
				break;
			case "-ep":
			case "--enviroment-port":
				if(args.length > i) {
					eType = "p";
					eData = {
						port: parseInt(args[++i]),
						authToken: args[++i]
					};
					nce   = false;
				} else
					console.error(color("No Environment Port specified", "red"));
				break;
			default:
				process.chdir(path.resolve(process.cwd(), args[i]));
				break;
		}
	}
	
	switchToMainDir();
	
	var eOptions = {};
	
	if(eType == "e" && !nce) {
		if(!path.existsSync(path.resolve(process.cwd(), "config/envs/", env + ".env.json"))) {
			var env_starter = require(path.resolve(__dirname, "../../../projects/web/env_starter"));
			var es = env_starter.start({port: 3001, env: env});
			end = function(){console.log("es: stop");es.stop();};
			eOptions.port = 3001;
		}
		eType = "f";
		eData = path.resolve(process.cwd(), "config/envs/", env + ".env.json");
	}
	
	switch(eType) {
		case "f": // Load env from file
			eOptions = JSON.parse(fs.readFileSync(eData));
			break;
		case "p":
			eOptions = eData;
			break;
	}
	
	var remote = new RemoteENV(eOptions, projConfig),
			routes = new RemoteRouter(remote),
			app    = new WebApp(routes, projConfig),
			config;
	
	var s = new require('net').Socket();
	
	s.connect(eOptions.port, function() {
		var t = "";
		
		s.on("data", function(d) {t+=d;}).on("close", function() {
			config = JSON.parse(t);
		});
		
		s.write(JSON.stringify({
			action: "config",
			data: ""
		}));
		
		s.write("END");
	});
	
	// refresh();
	
	console.log("loaded");
	
	app.start(config);
	
	end();
}
