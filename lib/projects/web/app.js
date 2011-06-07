var path        = require('path'),
		http        = require('http'),
		https       = require('https'),
		url         = require('url'),
		fs          = require('fs'),
		App         = require(path.resolve(__dirname, '../../utils', 'app')).App,
		Constants   = require(path.resolve(__dirname, 'constants')),
		Controllers = require(path.resolve(__dirname, 'utils/controllers'));

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
	
	controller = route.controller || sendParams.controller || "";
	
	action = route.action || sendParams.action || "index";
	
	format = sendParams.format || path.extname(parsedUrl.pathname) || 'html';
	
	if(format == 'htm')
		format = 'html';
	
	console.log('params: ', sendParams, ', controller: ', controller, ', action: ', action , ', format: ', format);
	
	//res.writeHead(200, {'Content-Type': 'text/html'});
	
	//res.end('<b>Hello, <i>' + (parsedUrl.query['name'] || 'World') + '</i>!!!</b>');
		
	console.log('path: ', parsedUrl);
	
	var controllerClass = Controllers.find(controller), controllerObj;
	
	if(!(controllerClass instanceof Error)) {
		console.log('class: ', controllerClass);
		
		controllerObj = new controllerClass();
		
		Controllers.runAction(controllerObj, action, {
			"request": req,
			"response": res,
			"url": parsedUrl,
			"params": sendParams
		});
	} else { // Check file system
		console.log('error: ', controllerClass);
		
		var checkLocs = [path.resolve("public/", (parsedUrl.pathname == '/' || parsedUrl.pathname == '') ? "index.html" : '.' + parsedUrl.pathname)];
		
		if(parsedUrl.pathname == '/' || parsedUrl.pathname == '')
			checkLocs.push(path.resolve("public/", "index.htm"));
		
		for(var i = 0; i < checkLocs.length; i++) {
			if(path.existsSync(checkLocs[i])) {
				res.writeHead(200);
				
				res.end(fs.readFileSync(checkLocs[i]));
			}
		}
		
		res.writeHead(404);
		
		res.end("404 not found");
	}
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
