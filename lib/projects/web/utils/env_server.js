var path      = require('path'),
		net       = require('net'),
		events    = require('events'),
		Class     = require(path.resolve(__dirname, '../../../class')).Class,
		Constants = require(path.resolve(__dirname, '../constants'));

exports.Server = new Class(function(ext) {
	console.log(ext);
	
	for(key in ext) {
		this[key] = ext[key];
	}
	
	events.EventEmitter.call(this);
}, {
	start: function() {
		this.authToken = require(path.resolve(__dirname, "../../../utils/hash/lib/hash")).sha512(this.authToken, this.projConfig.salt);
		var self = this, server = this._server = net.createServer(function(s) {
			var txt   = "", ready = false;
			
			s.on("data", function(d) {
				txt += d;
				console.log(self.authToken + ": ", txt);
				/*if(txt.substr(0,  self.authToken.length) == self.authToken) {
					ready = true;
					var start;
					txt = txt.substr(start = self.authToken.length, txt.length - start);
				}*/
				if(txt.substr(txt.length - 3, 3) == "END" && ready) { // Process request
					txt = txt.substr(0, txt.length - 3);
					
					var lines  = txt.split(/[\n\r]+/g),
							msg    = JSON.parse(txt),
							action = msg.action,
							data   = msg.data,
							res;
					
					switch(action) {
						case "router:find":
							res = self.routes.getRoute(data.url, data.method);
							break;
						case "router:params":
							var params = self.routes.getParams(data.route, data.url);
							
							res = {};
							
							data.route.path.replace(Constants.PATH_VAR_RE, function(a, n) {
								res[n] = params[n];
							});
							break;
						case "config":
							res = self.config;
							break;
						case "config:set":
							for(key in data) {
								self.config[key] = data[key];
							}
							
							res = true;
							break;
						case "config:get":
							res = self.config[data];
							break;
						case "global_context":
							res = self.globalContext;
							break;
						case "global_context:set":
							for(key in data) {
								self.globalContext[key] = data[key];
							}
							
							res = true;
							break;
						case "global_context:get":
							res = self.globalContext[data];
							break;
					}
					
					s.end(JSON.stringify(res));
				}
			});
			
			s.on("close", function() {
					
			});
		});
		
		if(this.port) {
			server.listen(this.port, function() {
				self.emit("listening", server.address());
			});
		} else {
			server.listen(function() {
				self.emit("listening", server.address());
			});
		}
	},
	stop: function() {
		this.emit("stop");
		this._server.close();
	}
});

exports.Server.extend(events.EventEmitter);
