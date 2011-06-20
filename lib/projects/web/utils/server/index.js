var path  = require('path'),
		url   = require('url'),
		http  = require('http'),
		https = require('https'),
		Class = require(path.resolve(__dirname, '../../../../class')).Class;

Object.prototype.each = function(fn) {
	for(key in this) {
		fn(this[key]);
	}
}

Array.prototype.each = function(fn) {
	for(var i = 0; i < this.length; i++) {
		fn(this[i]);
	}
}

String.prototype.each = function(fn) {
	var split = this.split('\n');
	for(var i = 0; i < split.length; i++) {
		fn(split[i] + '\n');
	}
}

function AppCallback(app, req, res, https, E500) {
	var env = {
		"headers": req.headers,
		"url": url.parse(req.url, true),
		"method": req.method
	}, rtn;
	
	//try {
		rtn = app.run(env);
	//} catch(e) {rtn = E500(env, e);}
	
	res.writeHead(rtn.status, rtn.headers);
	
	rtn.body.each(function(d) {res.write(d + '');});
	
	res.end();
}

exports.Server = new Class(function(E404, E500) {
	this.E404 = E404;
	this.E500 = E500;
}, {
	"start": function start(config) {
		var self = this;
		
		this.app = {
			run: function(env) {
				return self.E404(env);
			}
		};
		
		for(var i = 0; i < this.MW.length; i++) {
			this.app = new this.MW[i](this.app);
		}
		
		var httpServer = http.createServer(function(req, res) {
				AppCallback(self.app, req, res, false, self.E500);
			}), httpsServer;
		
		if(config && config.useHttps) {
			httpsServer = https.createServer({
				"key": fs.readFileSync(path.resolve(__dirname, '../../../../key.pem')),
				"cert": fs.readFileSync(path.resolve(__dirname, '../../../../cert.pem'))
			}, function(req, res) {
				AppCallback(self.app, req, res, true, self.E500);
			});
			
			this.httpsServer = httpsServer;
			
			httpsServer.listen(this.httpsPort);
		}
		
		this.httpServer = httpServer;
		
		httpServer.listen(this.httpPort);
	},
	"stop": function() {
		this.httpServer.close();
		if(this.httpsServer)
			this.httpsServer.close();
		
		this.app = undefined;
	},
	"MW": [],
	"app": undefined,
	"httpsPort": 3003,
	"httpPort": 3000,
	"addMiddleWare": function(mw) {
		this.MW.push(mw);
	}
});
