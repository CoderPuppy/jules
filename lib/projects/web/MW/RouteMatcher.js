var path        = require('path'),
		sys         = require('sys'),
		Controllers = require(path.resolve(__dirname, '../utils/controllers')),
		MW          = require(path.resolve(__dirname, 'MW')).MW;

exports.MW = MW.subClass(function CM(app) {
	this.app = app;
}, {
	call: function(env) {
		var jules = env.jules,
				app;
		
		if(typeof(jules.controller) == "string") {
			var controller = Controllers.find(jules.controller), controllerObj, action;
			
			if(!(controller instanceof Error)) {
				action = Controllers.getJack(controller, jules.action, env);
				
				app = action;
			}
		} else if(typeof(jules.controller) == "object" && typeof(jules.controller.call) == "function") {
			app = jules.controller
		} else if(typeof(jules.controller) == "function") {
			app = new jules.controller(this.app);
		}
		
		if(app === null || app === undefined) {return this.app.call(env);} else {return app.call(env);} 
	}
});
