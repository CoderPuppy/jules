var path     = require('path'),
		fs       = require('fs'),
		MW       = require(path.resolve(__dirname, 'MW')).MW,
		Template = require(path.resolve(__dirname, '../utils/templating')).Template;

function matches(loc, env) {
	if(typeof(loc) == 'string') {
		var filePath = path.resolve(process.cwd(), 'public', '.' + loc);
		
		return path.existsSync(filePath) ? filePath : undefined;
	} else {
		var good  = undefined,
				files = fs.readdirSync(path.resolve(process.cwd(), 'public', '.' + path.dirname(loc)));
		
		for(var i = 0; i < files.length; i++) {
			if(loc.test(files[i])) {
				good = path.resolve(process.cwd(), 'public', '.' + path.dirname(loc), files[i]);
				break;
			}
		}
		
		return good;
	}
}

function extend(a, b) {
	for(key in b) {
		a[key] = b[key];
	}
	return a;
}

function getTemplateContext(loc, env) {
	var rtnData = {};
	
	rtnData.__filename = loc;
	rtnData.__dirname  = path.dirname(loc);
	rtnData.status     = 200;
	rtnData.headers    = {};
	rtnData.context    = rtnData;
	rtnData.params     = extend(env.jules.params, env.url.query);
	rtnData.env        = env;
	
	return rtnData;
}

function execTmpl(loc, env) {
	var templateContext = getTemplateContext(loc, env);
	
	var rendered = (new Template(fs.readFileSync(loc) + ''))(templateContext);
	
	return {
		status: templateContext.status,
		headers: templateContext.headers,
		body: rendered
	};
}

String.prototype.escapeRegExp = function() {
	return this.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function log() {
	console.log.apply(console, arguments);
	
	return arguments.length == 0 ? null : (arguments.length > 1 ? arguments : arguments[0]);
}

exports.MW = MW.subClass(function TM(app) {
	this.app = app;
}, {
	call: function(env) {
		var locs    = [],
				paths   = env.jules.paths,
				curPath;
		
		var re = new RegExp("\\.(?:jst|" + env.jules.format + "\\.\\w*\\.tmpl)$");
		
		for(var i = 0; i < paths.length; i++) {
			curPath = paths[i];
			
			locs.push(paths[i] + '.jst');
			locs.push(new RegExp((path.basename(curPath, '.' + env.jules.format) + '.' + env.jules.format).escapeRegExp() + '\\.(\\w*)\\.tmpl$'));
			if(re.test(curPath)) {locs.push(curPath);}
		}
		
		for(var i = 0; i < locs.length; i++) {
			if(curPath = matches(locs[i], env)) {
				return execTmpl(curPath, env);
			}
		}
		
		return this.app.call(env);
	}
});
