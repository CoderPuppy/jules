var path     = require('path'),
		fs       = require('fs'),
		Class    = require(path.resolve(__dirname, '../../../class')).Class,
		jlRunner = require(path.resolve(__dirname, '../../../utils/jlRunner'));

function encodeToJSON(val) {
	var type = Object.prototype.toString.call(val);
	
	switch(type) {
		case "[object Array]":
		case "[object Arguments]":
		case "[object Collection]":
			var json = "[";
			for(var i = 0; i < val.length; i++) {
				json += encodeToJSON(val[i]);
			}
			return json + ']';
			break;
		case "[object Object]":
			var json = "{";
			
			for(key in val) {
				json += '"' + key + '":' + encodeToJSON(val[key]) + ',';
			}
			
			return json.substr(0, json.length-1) + '}';
		case "[object String]":
			return JSON.stringify(val);
			break;
		case "[object Function]":
			return val.toString();
			break;
		case "[object Date]":
			return "new Date(" + val.getTime() + ")";
			break;
		case "[object Boolean]":
			return val.toString();
			break;
		case "[object Number]":
			return val.toString();
			break;
		case "[object RegExp]":
			return val.toString();
			break;
	}
}

function encode(val) {
	return "{type: '" + Object.prototype.toString.call(val) + "', data: " + encodeToJSON(val) + "}";
}

exports.encode = encode;

function decode(str) {
	eval('return ' + str + ';');
}

exports.decode = decode;

exports.render = function(rjs, env, config) {
	var CODE    = new String(fs.readFileSync(path.resolve(__dirname, '../js/libs/', config.js_lib, 'RJS/PREFIX'))),
			context;
	
	eval('context = ' + fs.readFileSync(path.resolve(__dirname, '../js/libs/', config.js_lib, 'RJS/CONTEXT')) + '');
	
	eval(fs.readFileSync(path.resolve(__dirname, '../js/libs/', config.js_lib, 'RJS/PROGRAMATIC_CONTEXT')) + '');
	
	jlRunner.runSync(rjs, context);
	
	return {
		status: 200,
		headers: {"Content-Type": "text/javascript"},
		body: CODE + fs.readFileSync(path.resolve(__dirname, '../js/libs/', config.js_lib, 'RJS/SUFFIX'))
	};
}
