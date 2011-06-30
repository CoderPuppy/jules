var path  = require("path"),
		Class = require(path.resolve(__dirname, "../../../class")).Class;

exports.RemoteRouter = new Class(function(remoteEnv) {
	this.remoteEnv = remoteEnv;
}, {
	getRoute: function(url, method) {
		return this.remoteEnv.request("router:find", {
			url: url,
			method: method
		});
	},
	getParams: function(route, url) {
		return this.remoteEnv.request("router:params", {
			url: url,
			route: route
		});
	}
});
