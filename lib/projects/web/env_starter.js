var path          = require('path'),
		fs            = require('fs'),
		WebAppConfig  = require(path.resolve(__dirname, 'run_config')).Config,
		ProjectConfig = require(path.resolve(__dirname, '../../ProjectConfig')).ProjectConfig,
		GlobalContext = require(path.resolve(__dirname, 'GlobalConfig')).GlobalConfig,
		Constants     = require(path.resolve(__dirname, 'constants')),
		color         = require(path.resolve(__dirname, '../../utils/', 'color')).set,
		jlRunner      = require(path.resolve(__dirname, '../../utils/', 'jlRunner')),
		Router        = require(path.resolve(__dirname, './utils/', 'routing')).Router,
		ENVServer     = require(path.resolve(__dirname, './utils/', 'env_server')).Server;

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

var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

function randomString(numChars) {
	var str = "";
	
	for(var i = 0; i < numChars; i++) {
		str += chars.charAt(Math.random() * 36);
	}
	
	return str;
}

exports.randomString = randomString;

exports.start = function(options) {
	var env           = options.env || Constants.DEFAULT_ENV,
			routes        = new Router(),
			globalContext = new GlobalContext(),
			port          = options.port || Constants.DEFAULT_ENV_PORT,
			authToken     = randomString(100),
			server        = new ENVServer({
				routes: routes,
				globalContext: globalContext,
				port: port,
				env: env,
				authToken: authToken
			}),
			file          = "config/envs/",
			projConfig,
			envPath,
			config,
			context;
	
	/*for(var i = 0; i < args.length; i++) {
		switch(args[i]) {
			case "-e":
				if(args.length > i)
					env = args[++i];
				else
					console.error(color("No Environment specified", "red"));
				break;
			case "-p":
				if(args.length > i)
					port = args[++i];
				else
					console.error(color("No Port specified", "red"));
				break;
			case "-f":
				if(args.length > i)
					file = args[++i];
				else
					console.error(color("No File specified", "red"));
				break;
			default:
				process.chdir(path.resolve(process.cwd(), args[i]));
				break;
		}
	}*/
	
	if(options.dir) {
		process.chdir(options.dir);
	}
	
	switchToMainDir();
	
	if(options.file) {
		file = options.file;
		
		server.file = file;
	}
	
	projConfig = new ProjectConfig();
	
	server.projConfig = projConfig;
	
	switch(env) {
		case "production":
			env = "pro";
			break;
		case "development":
		case "devel":
			env = "dev";
			break;
	}
	
	config  = new WebAppConfig(env);
	
	server.config = config;
	
	file += env + ".env.json";
	
	function refresh() {
		// Run config/env.jl
		
		context = {
			"ENV_VARS": process.env,
			"app": config.app,
			"env": env,
			"config": config
		};
		
		jlRunner.runFileSync(path.resolve(process.cwd(), Constants.ENV_FILE), context);
		
		context = {
			"ENV_VARS": process.env,
			"app": config.app,
			"config": config
		};
		
		envPath = path.resolve(process.cwd(), Constants.ENVS_DIR, env.toLowerCase() + '.jl');
		
		if(path.existsSync(envPath)) {
			jlRunner.runFileSync(envPath, context);
		} else {
			console.error(color("Nonexistant environment: " + env, 'red'));
		}
		
		context = {
			"app": config.app,
			"config": config
		};
		
		jlRunner.runFileSync(Constants.APP_FILE, context);
		
		context = {
			"map": function(fn) {
				fn({
					"resource": function resource(controller, options) {
						var basePath = typeof(options == 'object') && typeof(options.base) == 'string' ? options.base : controller;
						
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
							"path": basePath +  '/:id:', 
							"method": "post",
							"action": "update",
							"type": "route"
						});
						routes.addNamedRoute(controller + '_delete', {
							"controller": controller,
							"path": basePath + '/:id:',
							"method": "delete",
							"action": "delete",
							"type": "route"
						});
						routes.addNamedRoute(controller + '_show', {
							"controller": controller,
							"path": basePath + '/:id:',
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
						
						if(typeof(action) == 'undefined') {
							action = controller;
							controller = method;
							method = 'all';
						}
						
						if(typeof action == 'undefined') {
							action = controller.split('#')[1];
							controller = controller.split('#')[0];
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
	
	refresh();
	
	
	server.start();
	
	fs.writeFileSync(file, JSON.stringify({
		env: env,
		port: port,
		auth_token: authToken
	}));
	
	server.refresh = function() {refresh();};
	
	server.on("stop", function() {
		if(path.existsSync(file))
			fs.unlink(file);
	});
	
	return server;
}
