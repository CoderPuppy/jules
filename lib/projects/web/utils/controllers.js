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
	var controllerPath = path.resolve(Constants.CONTROLLERS_ROOT, ucfirst(name.toLowerCase()) + 'Controller.jl');
	
	console.log('name: ', name);
	
	console.log('path: ', controllerPath);
	
	if(path.existsSync(controllerPath)) {
		var context = {
			"Controller": Controller
		};
		
		if(!(/^app[lication]{0,8}$/i.test(name))) {
			context["ApplicationController"] = exports.find("application");
		} else {
			name = "Application";
		}
		
		context[ucfirst(name.toLowerCase()) + 'Controller'] = undefined;
		
		jlRunner.runFileSync(controllerPath, context);
		
		return context[ucfirst(name.toLowerCase()) + 'Controller'];
	} else {
		return new Error("Nonexistant Controller: " + name);
	}
}

exports.runAction = function runAction(controller, action, data) {
	console.log("running the %s action of", action, controller);
	
	var params = data.url.query;
	
	exports.find('Application').extend({"url": data.url});
	
	try {
	controller[ucfirst(action.toLowerCase()) + 'Action'](data.params, params);
	} catch(e) {
		console.error(color(e.message, 'red'));
		
		data.response.writeHead(404);
		
		data.response.end('404 not found');
		
		return;
	}
	
	data.response.end();
}
