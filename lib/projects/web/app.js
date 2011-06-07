var path      = require('path'),
		http      = require('http'),
		https     = require('https'),
		url       = require('url'),
		fs        = require('fs'),
		App       = require(path.resolve(__dirname, '../../utils', 'app')).App,
		Constants = require(path.resolve(__dirname, 'constants'));

function extname(webPath) {
	/*var splitPath = webPath.split('/'), baseName = splitPath[splitPath.length-1], baseSplit = baseName.split('.');
	
	if(splitPath[0] == '')
		splitPath.splice(0, 1);
	
	console.log('splitPath: ', splitPath, ', baseName: ', baseName);
	
	if(baseSplit.length == 1) {
		return 'html';
	} else {
		return baseSplit.splice(1, baseSplit.length - 1).join('.');
	}*/
	
	return path.extname(webPath);
}

function AppCallback(routes, req, res, https) {
	var controller,
			action,
			format     = 'html',
			parsedUrl  = url.parse(req.url, true),
			route      = routes.getRoute(req),
			params     = routes.getParams(route, parsedUrl.pathname),
			sendParams = {};
	
	route.path.replace(Constants.PATH_VAR_RE, function(a, $1) {
			sendParams[$1] = params[$1];
	});
	
	//console.log('controller: ', route.controller, ', action: ', route.action);
	
	controller = route.controller || sendParams.controller || "Application";
	
	action = route.action || sendParams.action || "index";
	
	format = sendParams.format || /*path.*/extname(parsedUrl.pathname) || 'html';
	
	console.log('params: ', sendParams, ', controller: ', controller, ', action: ', action , ', format: ', format);
	
	res.writeHead(200, {'Content-Type': 'text/html'});
	
	res.end('<b>Hello, <i>' + (parsedUrl.query['name'] || 'World') + '</i>!!!</b>');
}

exports.WebApp = App.subClass(function(routes) {
	this.routes = routes;
	
	console.log('routes: ', routes);
}, {
	"start": function start(config) {
		var httpServer = http.createServer(function(req, res) {
				AppCallback(self.routes, req, res, false);
			}), httpsServer, self = this;
		
		if(config && config.useHttps) {
			httpsServer = https.createServer({
				"key": fs.readFileSync(path.resolve(__dirname, '../../key.pem')),
				"cert": fs.readFileSync(path.resolve(__dirname, '../../cert.pem'))
			}, function(req, res) {
				AppCallback(self.routes, req, res, true);
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
	},
	"httpsPort": 3003,
	"httpPort": 3000
});
