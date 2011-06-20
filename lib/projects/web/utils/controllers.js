var path      = require('path'),
		jlRunner  = require(path.resolve(__dirname, '../../../utils/', 'jlRunner')),
		Constants = require(path.resolve(__dirname, '../constants')),
		Class     = require(path.resolve(__dirname, '../../../class')).Class,
		color     = require(path.resolve(__dirname, '../../../utils/color')).set;

function ucfirst(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

var Controller = new Class(function() {
		
}, {
	
});

exports.find = function find(name) {
	if(name !== undefined && name !== null) {
		var context = {
			"Controller": Controller
		};
		
		if(!(name.toLowerCase() == "app" || name.toLowerCase() == "application")) {
			context["ApplicationController"] = exports.find("application");
		} else {
			name = "Application";
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

exports.runAction = function runAction(controller, action, data) {
	var params = data.url.query;
	
	exports.find('Application').extend({"url": data.url});
	
	try {
		return controller[ucfirst(action.toLowerCase()) + 'Action'](data);
	} catch(e) {
		console.error(color(e.message, 'red'));
		
		return null;
	}
}
