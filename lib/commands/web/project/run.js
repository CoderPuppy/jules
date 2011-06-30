var path          = require('path'),
		fs            = require('fs'),
		http          = require('http'),
		https         = require('https'),
		jlRunner      = require(path.resolve(__dirname, '../../../utils/', 'jlRunner')),
		color         = require(path.resolve(__dirname, '../../../utils/', 'color')).set,
		WebAppConfig  = require(path.resolve(__dirname, '../../../projects/web/', 'run_config')).Config,
		Constants     = require(path.resolve(__dirname, '../../../projects/web/', 'constants')),
		WebApp        = require(path.resolve(__dirname, '../../../projects/web/', 'app')).WebApp,
		funcUtils     = require(path.resolve(__dirname, '../../../utils/', 'funcUtils')),
		Router        = require(path.resolve(__dirname, '../../../projects/web/utils/', 'routing')).Router,
		ProjectConfig = require(path.resolve(__dirname, '../../../ProjectConfig')).ProjectConfig
		GlobalContext = require(path.resolve(__dirname, '../../../projects/web/GlobalConfig')).GlobalConfig,
		Async         = require(path.resolve(__dirname, '../../../utils/async'));

function rateLimit(fn, ms) {
  var last = (new Date()).getTime();
  return (function() {
    var now = (new Date()).getTime();
    if (now - last > ms) {
      last = now;
      fn.apply(null, arguments);
    }
  });
}

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
	var env           = Constants.DEFAULT_ENV,
			routes        = new Router(),
			projConfig    = new ProjectConfig(),
			app           = new WebApp(routes, projConfig),
			globalContext = new GlobalContext(),
			envPath,
			config,
			context;
	
	for(var i = 0; i < args.length; i++) {
		switch(args[i]) {
			case "-e":
				if(args.length > i)
					env = args[++i];
				else
					console.error(color("No Environment specified", "red"));
				break;
			default:
				process.chdir(path.resolve(process.cwd(), args[i]));
				break;
		}
	}
	
	switchToMainDir();
	
	var appDirs = fs.readdirSync(path.resolve(process.cwd(), "app")).map(function(file) {
		return path.resolve(process.cwd(), 'app', file);
	}).filter(function(file) {
		return fs.statSync(file).isDirectory();
	});
	
	appDirs.forEach(function(appDir) {
		appDirs = appDirs.concat(fs.readdirSync(path.resolve(process.cwd(), "app", appDir)).map(function(file) {
			return path.resolve(process.cwd(), 'app', appDir, file);
		}).filter(function(file) {
			return fs.statSync(file).isDirectory();
		}));
	});
	
	jlRunner.checkPaths.concat(appDirs);
	jlRunner.checkPaths.push(path.resolve(process.cwd, 'lib'));
	
	switch(env) {
		case "production":
			env = "pro";
			break;
		case "development":
		case "devel":
			env = "dev";
			break;
	}
	
	config  = new WebAppConfig(env, app);
	process.env.JULES_ENV = env;
	
	function refresh() {
		// Run config/env.jl
		
		context = {
			"ENV_VARS": process.env,
			"app": app,
			"env": env,
			"config": config
		};
		
		jlRunner.runFileSync(path.resolve(process.cwd(), Constants.ENV_FILE), context);
		
		if(context.env && context.env != env) {
			env = context.env;
			
			config = new WebAppConfig(env, app);
		}
		
		context = {
			"ENV_VARS": process.env,
			"app": app,
			"config": config
		};
		
		envPath = path.resolve(process.cwd(), Constants.ENVS_DIR, env.toLowerCase() + '.jl');
		
		if(path.existsSync(envPath)) {
			jlRunner.runFileSync(envPath, context);
		} else {
			console.error(color("Nonexistant environment: " + env, 'red'));
		}
		
		context = {
			"app": app,
			"config": config
		};
		
		jlRunner.runFileSync(Constants.APP_FILE, context);
		
		context = {
			"map": function(fn) {
				fn({
					"resource": function resource(controller, options) {
						var basePath;
						
						if(typeof(options) == "object") {if(typeof(options.base) == "string") {basePath = options.base;} else {basePath = "/" + controller;}} else {basePath = "/" + controller;}
						
						routes.addNamedRoute(controller, {
							"controller": controller,
							"path": basePath,
							"method": "get",
							"action": "index",
							"type": "route"
						});
						routes.addNamedRoute(controller + '_new', {
							"controller": controller,
							"path": basePath + '/new',
							"method": "get",
							"action": "new",
							"type": "route"
						});
						routes.addNamedRoute(controller + '_update', {
							"controller": controller,
							"path": basePath +  '/:id', 
							"method": "post",
							"action": "update",
							"type": "route"
						});
						routes.addNamedRoute(controller + '_delete', {
							"controller": controller,
							"path": basePath + '/:id',
							"method": "delete",
							"action": "delete",
							"type": "route"
						});
						routes.addNamedRoute(controller + '_show', {
							"controller": controller,
							"path": basePath + '/:id',
							"method": "get",
							"action": "show",
							"type": "route"
						});
						
						return this;
					},
					"connect": function connect(route, method, options) {
						if(typeof(method) == 'object') {
							options = method;
							method = 'all';
						}
						
						routes.addRoute({
							"path":  route,
							"method": method ? method.toLowerCase() : 'all',
							"type": "connect",
							"options": options
						});
						
						return this;
					},
					"namedRoute": function namedRoute(name, route, method, options) {
						if(typeof(method) == 'object') {
							options = method;
							method = 'all';
						}
						
						routes.addNamedRoute(name, {
							"path":  route,
							"method": method ? method.toLowerCase() : 'all',
							"type": "route",
							"options": options
						});
						
						return this;
					},
					"route": function route(route, method, controller, action, options) {
						if(typeof(action) == 'object') {
							options = action;
							controller = method;
							action = controller;
							method = 'all';
						}
						
						if(typeof(action) == 'undefined' && typeof(method) == "string") {
							action = controller;
							controller = method;
							method = 'all';
						}
						
						if(typeof(action)== 'undefined') {
							if(typeof(controller) == "string") {
								action = controller.split('#')[1];
								controller = controller.split('#')[0];
							}
						}
						
						routes.addRoute({
							"path": route,
							"controller": controller,
							"action": action,
							"options": options
						});
						
						return this;
					},
					"root": function root(method, options) {
						if(typeof(method) == 'object') {options = method; method = 'all';}
						
						return this.namedRoute('root', '/', method, options);
					},
					"controller": function constroller(controller, fn) {
						var self = this;
						
						if(!(controller || fn)) return this;
						
						fn({
							"route": function route(route, method, action, options) {
								self.route(route, method, controller, action, options);
								
								return this;
							},
							"resource": function resource(options) {
								self.resource(controller, options);
								
								return this;
							},
							"connect": function connect(route, method, options) {
								if(!options) {
									options = {
										"controller": controller
									};
								} else {
									options.controller = controller;
								}
								if(!(route || method)) return this;
								
								self.connect(route, method, options);
							},
							"namedRoute": function namedRoute(named, route, method, options) {
								if(!options) {
									options = {
										"controller": controller
									};
								} else {
									options.controller = controller;
								}
								if(!(route || method)) return this;
								
								self.namedRoute(route, method, options);
							}
						});
					}
				});
			},
			"env": env
		};
		
		jlRunner.runFileSync(path.resolve(process.cwd(), Constants.ROUTES_FILE), context);
	}
	
	process.on('SIGINT', function() {
		app.stop();
		
		process.exit(0);
	});
	
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	
	process.stdin.on('data', function (chunk) {
		chunk = (chunk + '').trim();
		
		switch(chunk) {
			case 'r':
			case 'refresh':
				refresh();
				break;
		}
	});
	
	refresh();
	
	app.start(config);
}
