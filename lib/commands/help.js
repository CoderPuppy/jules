var path    = require('path'),
		fs      = require('fs'),
		command = require(path.resolve(__dirname, '../utils/command'));

exports.run = function(args) {
	var cmd = 'help';
	
	if(args.length > 0) {
		cmd = args[0];
	}
	
	process.stdin.resume();
	
	fs.readFile(path.resolve(__dirname, command.resolve(cmd).join('/') + '.txt'), function(er, helpTxt) {
		if(er) process.exit(1);
		
		console.log(helpTxt + '');
		process.exit(0);
	});
}
