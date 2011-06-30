var path = require("path");
var env = require(path.resolve(__dirname, 'env_starter'));
var net = require("net");
/*var ss = env.start({
	dir: "../../../test",
	port: 3001
});*/

var txt = "";

process.stdin.on("data", function(d) {txt += d;});

function q(question) {
	console.log(question + ": ");
	txt = "";
	process.stdin.resume();
	while(txt.substr(txt.length - 3, 3) != "END") {}
	process.stdin.pause();
	return txt;
}

var authToken = "450b1b5edc205b95ee5ea214e505800aa840a6d75f3200655b6de9650c6e28d8e5a0b5c209856cfec1354a89839a1271b6906ba42de08a9fc07a1211b735b419";

Object.prototype.values = function() {
	var V = [];
	
	for(key in this) {
		if(!(key in Object.prototype) && !(key in this.constructor.prototype)) {
			V.push(this[key]);
		}
	}
	
	return V;
}

var done = {};

process.on("SIGINT", function() {
//	ss.stop();
	process.exit();
});


function getSync(fn, thisO) {
	var rtn = (Math.random() * 100) + (Math.random() * 100), orig = rtn;
	
	process.nextTick(function() {
		fn.call(thisO || this, function() {
			rtn = arguments[0];
		});
	});
	
	while(rtn == orig) {}
	
	return rtn;
}

function makeRequest(action, data, callback) {
	var s = new net.Socket(), t = "";
	
	function get(action, data, c) {
		s.connect(3001, function() {
			s.on("data", function(d) {
				t += d;
			}).on("end", function() {
				console.log(action + ': ', t);
				c(JSON.parse(t));
			});
			
			//s.write(authToken);
			
			s.write(JSON.stringify({
				action: action,
				data: data
			}));
			
			s.end("END");
		});
	}
	
	if(typeof(callback) != "function") {
		return getSync(function(c) {
			get(action, data, c);
		});
	} else {
		process.nextTick(function() {
			get(action, data, callback);
		});
	}
}

/*var t = "";

var s = new net.Socket();
s.connect(3001, function() {
	s.on("data", function(d) {
		t += d;
	}).on("end", function() {
		console.log('t: ', t);
	});
	
	s.write(JSON.stringify({
		action: "router:find",
		data: {
			url: "/app/drew.json",
			method: "get"
		}
	}));
	
	s.end("END");
	
	ss.stop();
});

var ns = new net.Socket();
ns.connect(3001, function() {
	var nt = "";
	
	ns.on("data", function(d) {nt += d;}).on("close", function() {
		console.log('nt: ', nt);
	});
	
	ns.write(JSON.stringify({
		action: "router:params",
		data: {
			route: {
				path: "/:controller(/:action)(.:format)",
				method: "all"
			},
			url: "/app/drew.json"
		}
	}));
	
	ns.write("END");
});*/

done["router:params"] = false;
makeRequest("router:params", {
	route: {
		path: "/:controller(/:action)(.:format)",
		method: "all"
	},
	url: "/app/drew.json"
}, function(rd) {
	console.log("params: ", rd);
	done["router:params"] = true;
	check();
});

done["router:find"] = false;
makeRequest("router:find", {
	url: "/app/drew.json",
	method: "get"
}, function(rd) {
	console.log("route: ", rd);
	done["router:find"] = true;
	check();
});

done["config"] = false;
makeRequest("config", {}, function(c) {
	console.log('config: ', c);
	done["config"] = true;
	check();
});

function check() {
	if(done.values().every(function(o) {return o == true;})) {
//		ss.stop();
		process.exit();
	} else {
		setTimeout(check, 2500);
	}
}
