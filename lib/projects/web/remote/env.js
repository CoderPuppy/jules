var path  = require("path"),
		net   = require("net"),
		Class = require(path.resolve(__dirname, "../../../class")).Class;

function getSync(fn, thisO) {
	var rtn = (Math.random() * 100) + (Math.random() * 100), orig = rtn;
	
	fn.call(thisO || this, function() {
			rtn = arguments[0];
			console.log("loaded");
	});
	
	while(rtn == orig) {}
	
	return rtn;
}

function makeRequest(port, authToken, action, data, callback) {
	var t = "", self = this;
	
	console.log('port: ', port);
	
	function get(action, data, c) {
		console.log("getting");
		
		var s = new net.Socket();
		console.log("connecting");
		s.on("error", function() {console.error(arguments);}).on("connection", function(){console.log("connected");});
		s.connect(port, function() {
			console.log("connected");
			
			s.on("data", function(d) {
				t += d;
			}).on("end", function() {
				console.log(action + ': ', t);
				c(JSON.parse(t));
			});
			
			s.write(authToken);
			
			console.log("file: ", __filename, ", line: ", 41);
			
			s.write(JSON.stringify({
				action: action,
				data: data
			}));
			
			s.end("END");
		});
	}
	
	if(typeof(callback) != "function") {
		return getSync(function(c) {
			get(action, data, function(d){
				console.log("c: ", d);
				c(d);
			});
		});
	} else {
		get(action, data, function() {callback();});
	}
}

exports.RemoteENV = new Class(function(eOptions, projConfig) {
	this.eOptions = eOptions;
	this.projConfig = projConfig;
	
	this.authToken = require(path.resolve(__dirname, "../../../utils/hash/lib/hash")).sha512(this.eOptions.authToken, this.projConfig.salt);
}, {
	request: function(action, data, callback) {
		console.log('this: ', this);
		return makeRequest(this.eOptions.port, this.authToken, action, data, callback);
	}
});
