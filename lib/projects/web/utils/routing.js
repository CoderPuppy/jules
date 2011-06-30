var path        = require('path'),
		url         = require('url'),
		querystring = require('querystring'),
		Class       = require(path.resolve(__dirname, '../../../class')).Class,
		XRegExp     = require(path.resolve(__dirname, '../../../utils', 'xregexp')).XRegExp,
		Constants   = require(path.resolve(__dirname, '../', 'constants'));

function RouteToRe(route) {
	/*function processIt(path, match) {
		var prMatches = XRegExp.matchRecursive(match, "\\(", "\\)", 'g'), i = 0;
		
(prMatches.length);
		
		if(prMatches.length > 0) {
			for(; i < prMatches.length; i++) {
('match: ', prMatches[i], ', rtn: ', processIt(path, prMatches[i]));
			}
		}
		
		return "done";
	}*/
	
	return XRegExp("^" + route.path.replace(/([\/\.])/g, '\\$1').replace(/\(([^\)\s]*)\)/g, function(all, $1) {
		return '(?:' + 	$1 + ')?';
	}).replace(Constants.PATH_VAR_RE, function(all, $1) {
		if(route.options && route.options.requirements[$1]) {			
			var requirements = route.options.requirements[$1];
			
			return '(?<' + $1 + '>' + requirements + ')';
		} else {
			return "(?<" + $1 + ">[\\w\\d]*)";
		}
	}) + "$");
	
	/*var path = route.path, i = 0;
	
	var prMatches = XRegExp.matchRecursive(path, "\\(", "\\)", 'g');
	
	console.log(prMatches);
	
	for(; i < prMatches.length; i++) {
		console.log('match: ', prMatches[i], ', rtn: ', processIt(path, prMatches[i]));
	}*/
}

// exports.RTR = RouteToRe;

function RouteExec(route, url) {
	var urlRegExp = RouteToRe(route);
	
	return urlRegExp.exec(url);
}

function RouteMatches(route, url, method) {
	var execed = RouteExec(route, url), good = execed !== null && execed !== undefined;
	if(route.method && good)
		good = (route.method == 'all' || route.method.toLowerCase() == method.toLowerCase());
	
	return good;
}

exports.RouteMatches = RouteMatches;

exports.Router = new Class({
	"addRoute": function addRoute(route) {
		this.routes.push(route);
	},
	"addNamedRoute": function addNamedRoute(name, route) {
		this.addRoute(route);
		this.namedRoutes[name] = this.routes.length - 1
	},
	"routes": [],
	"namedRoutes": {},
	"getRoute": function(url, method) {
		var routes = this.routes, i = 0, route;
		
		for(; i < routes.length; i++) {
			route = routes[i];
			
			if(RouteMatches(route, url, method)) {
				return route;
			}
		}
	},
	"getParams": function(route, url) {
		return RouteExec(route, url);
	}
});
