// Get just the arguments
var fs   = require('fs'),
		path = require('path');

if(process.argv.length <= 2) {
	console.log(fs.readFileSync(path.resolve(__dirname, "noCommand.txt")) + '');
} else {
	
	var argv        = process.argv.slice(2),
			command     = argv[0],
			commandFile = command.split(':'),
			vm          = require('vm'),
			redirects   = JSON.parse(fs.readFileSync(path.resolve(__dirname, './redirects.json')) + '');
	
	function Redirect(redirects, splitCommand) {
		var redirect = redirects[splitCommand[0]];
		
		if(redirect !== undefined) {
			if(typeof redirect == "object") {
				splitCommand.splice.apply(splitCommand, [0, 1].concat(redirect));
			} else {
				splitCommand[0] = redirect;
			}
			
			return Redirect(redirects, splitCommand);
		} else {
			return splitCommand;
		}
	}
	
	function run(commandFile, args) {
		commandFile = Redirect(redirects, commandFile);
		
		redirect = redirects['*'][commandFile];
				
		if(commandFile.length == 1 && redirect) {
			commandFile[0] = redirect;
			if(typeof redirect == "object") {
				commandFile.splice.apply(commandFile, [0, 1].concat(redirect));
			} else {
				commandFile[0] = redirect;
			}
			
			commandFile = Redirect(redirects, commandFile);
		}
		
		// Found what command they want
		
		// Now run it
		
		var commandPath = path.join(__dirname, "./commands/" + commandFile.join('/') + '');
		
		path.exists(commandPath + '.js', function(exists) {
			if(exists && args.length > 1) {
				args = args.slice(1);
			}
			
			if(exists) {
				require(commandPath).run(args);
			} else {
				return run(['create'], args);
			}
		});
		
		// Ran it
	}
	run(commandFile, argv);
}
