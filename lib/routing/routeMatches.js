var n = require('natives');
var path = n.path;
var routeToRe = require(path.join(__dirname, 'routeToRe'));

var routeMatches = module.exports = function routeMatches(route, req) {
	var good = routeToRe(route).exec(req.path);
	
	
};
