var path        = require('path'),
		App         = require(path.resolve(__dirname, '../../utils', 'app')).App,
		Jules       = require(path.resolve(__dirname, 'jules_s')),
		Errors      = Jules.Errors,
		MW          = Jules.MW,
		Constants   = require(path.resolve(__dirname, 'constants')),
		Server      = require(path.resolve(__dirname, 'utils/server')).Server;

exports.WebApp = App.subClass(function(routes, config) {
	this.routes = routes;
	
	this.server = new Server(Errors[404], Errors[500]);
	
	// Add middleware for Jules
	
	this.server.addMiddleWare(MW.StaticMatcher);
	this.server.addMiddleWare(new MW.RJSMatcher(config));
	this.server.addMiddleWare(MW.TemplateMatcher);
	this.server.addMiddleWare(MW.FilePreparer);
	this.server.addMiddleWare(MW.ControllerMatcher);
	this.server.addMiddleWare(new MW.ParamParser(routes));
}, {
	"start": function start(config) {
		this.server.httpsPort = this.httpsPort;
		this.server.httpPort = this.httpPort;
		this.server.start(config);
	},
	"stop": function() {
		this.server.stop();
	},
	"httpsPort": 3003,
	"httpPort": 3000
});
