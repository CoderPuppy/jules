var net = require("net");

exports.RemoteConfig = function(remoteEnv) {
	console.log("loading config");
	var rtn = "RTN_ORIG";
	var s = new net.Socket(), t = "";
	
	s.connect(remoteEnv.eOptions.port, function() {
		console.log("connected");
		
		s.on("data", function(d){t+=d;}).on("end", function() {rtn = JSON.parse(t);});
		
		s.write(remoteEnv.authToken);
		
		s.write(JSON.stringify({
			action: "config",
			data: {}
		}));
		
		s.write("END");
	});
	
	while(rtn == "RTN_ORIG") {}
	return rtn;
};
