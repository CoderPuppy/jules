var path  = require('path'),
		sys   = require('sys'),
		Class = require(path.resolve(__dirname, '../../class')).Class;

exports.Errors = {
	404: function(env) {
		return {
			status: 404,
			headers: {},
			body: "404 Page not found: " + env.url.pathname + '\nenv: ' + sys.inspect(env)
		};
	},
	500: function(env, e) {
		return {
			status: 500,
			headers: {},
			body: '500: ' + sys.inspect(e, true, null)
		};
	}
};

exports.MW = {
	"RouteMatcher"   : require(path.resolve(__dirname, 'MW', 'RouteMatcher')).MW,
	"TemplateMatcher": require(path.resolve(__dirname, 'MW', 'TemplateMatcher')).MW,
	"StaticMatcher"  : require(path.resolve(__dirname, 'MW', 'StaticMatcher')).MW,
	"ParamParser"    : require(path.resolve(__dirname, 'MW', 'ParamParser')).MW,
	"FilePreparer"   : require(path.resolve(__dirname, 'MW', 'FilePreparer')).MW,
	"RJSMatcher"     : require(path.resolve(__dirname, 'MW', 'RJSMatcher')).MW
};
