var celeri = require('celeri');
var n = require('natives');
var path = n.path;

var commands = require(path.join(__dirname, '../lib/commands'));

commands.add(function() {
	commands.add(celeri);
	
	celeri.open();
	celeri.parse(process.argv, function(e, cmd) {
		if(e) throw e;
		
		process.exit();
	});
});
