var path      = require('path'),
		url       = require('url'),
		Class     = require(path.resolve(__dirname, '../../../class')).Class,
		Constants = require(path.resolve(__dirname, '../constants'));

exports.MW = new Class(function PP(routes) {
	return function PP(app) {
		return {
			run: function(env) {
				var	format     = 'html',
						route      = routes.getRoute(env.url.pathname, env.method),
						sendParams = {},
						controller,
						action,
						params;
				
				if(route) {
					params = routes.getParams(route, env.url.pathname);
					
					route.path.replace(Constants.PATH_VAR_RE, function(a, $1) {
							sendParams[$1] = params[$1];
					});
				}
				
				controller = (route && route.controller ? route.controller : (sendParams.controller || ""));
				action     = (route && route.action     ? route.action     : (sendParams.action     || "index"));
				extFormat = path.extname(env.url.pathname);
				format = sendParams.format || (extFormat.length > 0 ? extFormat.substr(1) : 'html') || 'html';	
				
				if(env.url.pathname == '' || env.url.pathname == '/') {
					if(routes.namedRoutes['root'] !== undefined && routes.namedRoutes['root'] !== null) {
						var root = routes.routes[routes.namedRoutes['root']].options;
						
						controller = root.controller || controller;
						action     = root.action     || action;
					} else {
						controller = "index";
					}
				}
				
				if(format == 'htm')
					format = 'html';
				
				env.jules = {
					controller: controller,
					action: action,
					format: format,
					params: sendParams,
					route: route
				};
				
				return app.run(env);
			}
		};
	};
});
