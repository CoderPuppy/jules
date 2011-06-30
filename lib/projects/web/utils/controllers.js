var path      = require('path'),
		jlRunner  = require(path.resolve(__dirname, '../../../utils/', 'jlRunner')),
		Constants = require(path.resolve(__dirname, '../constants')),
		Class     = require(path.resolve(__dirname, '../../../class')).Class,
		color     = require(path.resolve(__dirname, '../../../utils/color')).set;

function ucfirst(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

var ActionHelper = new Class(function(controller, action, env) {
	this.controller = controller                ;
	this.actionName = action                    ;
	this.action     = controller.actions[action];
	this.env        = env                       ;
}, {
	redirect: function(url, status) {
		var res = {
			status: 302,
			headers: {
				Location: url
			},
			body: ''
		};
		
		if(process.env.JULES_ENV == "pro") {
			res.status = 301;
		}
		
		if(typeof(status) === "number") {
			res.status = status;
		}
		
		return res;
	}
}).properties({
	"params": {
		get: function() {
			return this.env.jules.params;
		}
	},
	"query": {
		get: function() {
			return this.env.url.query;
		}
	}
});

var Controller = new Class(function() {}, {
	actions: {},
	jack: function(action) {
		var self = this;
		
		return {
			call: function(env) {
				return self.actions[action](new ActionHelper(self, action, env));
			}
		};
	}
});

function controller(fn) {
	var helper = {
		action: function(name, fn) {
			controller.actions[name] = fn;
		}
	},
	controller = new Controller();
	
	fn(helper);
	
	return controller;
}

exports.find = function find(name) {
	if(name !== undefined && name !== null) {
		var context = {
			"controller": controller
		};
		
		if(!(name.toLowerCase() == "app" || name.toLowerCase() == "application")) {
			context["AppController"] = exports.find("App");
		} else {
			name = "App";
		}
		
		var controllerPath = path.resolve(Constants.CONTROLLERS_ROOT, ucfirst(name.toLowerCase()) + 'Controller.jl')
		
		if(path.existsSync(controllerPath)) {
			context[ucfirst(name.toLowerCase()) + 'Controller'] = undefined;
			
			jlRunner.runFileSync(controllerPath, context);
			
			return context[ucfirst(name.toLowerCase()) + 'Controller'];
		} else {
			return new Error("Nonexistant Controller: " + name);
		}
	} else {
		return new Error("Nonexistant Controller: " + name);
	}
}

exports.getJack = function getJack(controller, action, data) {
	var params = data.url.query;
	
	try {
		return controller.jack(action);
	} catch(e) {
		console.error(color(e.message, 'red'));
		
		return null;
	}
}
