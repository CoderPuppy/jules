// Get just the arguments
var fs            = require('fs'),
		path          = require('path'),
		command       = require(path.resolve(__dirname, 'utils/command'));

if(process.argv.length <= 2) {
	console.log(fs.readFileSync(path.resolve(__dirname, "noCommand.txt")) + '');
} else {
	
	var argv        = process.argv.slice(2),
			commandStr  = argv[0],
			commandFile = commandStr.split(':'),
			vm          = require('vm');
	
	function run(commandFile, args) {
		commandFile = command.resolve(commandFile);
		
		// Found what command they want
		
		// Now run it
		
		var commandPath = path.join(__dirname, "./commands/" + commandFile.join('/') + '');
		
		path.exists(commandPath + '.js', function(exists) {
			if(exists && args.length >= 1) {
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
