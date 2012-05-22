var n = require('natives');
var path = n.path;
var routeMatches = require(path.join(__dirname, 'routeMatches'));

var Router = module.exports = (function RouterClass() {
	function Router() {
		this.routes = [];
		this.named = {};
	}
	
	Router.prototype.add = function add(route) {
		var index = this.routes.push(route) - 1;
		
		if(typeof(route.name) !== 'undefined') this.named[route.name] = index;
		
		return this;
	};
	
	Router.prototype.find = function find(req) {
		return this.routes.filter(function(route) {
			return routeMatches(route, req);
		});
	};
	
	return Router;
})();
