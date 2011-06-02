// Get just the arguments

var argv        = process.argv.slice(2),
		command     = argv[0],
		commandFile = command.split(':'),
		fs          = require('fs'),
		path        = require('path'),
		vm          = require('vm'),
		redirects   = JSON.parse(fs.readFileSync(path.resolve(__dirname, './redirects.json')) + '');

console.log(__dirname, __filename, path.resolve(__dirname, './redirects.json'), redirects);
//process.exit();
		
// TODO: Find Command And Run it

function Redirect(redirects, splitCommand) {
	var redirect = redirects[splitCommand[0]];
	console.log('func redirect: ', redirect);
	if(redirect !== undefined) {
		console.log('redirect !== undefined');
		if(typeof redirect == "object") {
			splitCommand.splice.apply(splitCommand, [0, 1].concat(redirect));
		} else {
			splitCommand[0] = redirect;
		}
		console.log('splitCommand: ', splitCommand);
		return Redirect(redirects, splitCommand);
	} else {
		return splitCommand;
	}
}

function run(commandFile, args) {
	console.log('args: ', args);
	
	console.log('now');
	
	commandFile = Redirect(redirects, commandFile);
	
	redirect = redirects['*'][commandFile];
	
	console.log('* redirect: ', redirect)
	
	if(commandFile.length == 1 && redirect) {
		commandFile[0] = redirect;
		if(typeof redirect == "object") {
			commandFile.splice.apply(commandFile, [0, 1].concat(redirect));
		} else {
			commandFile[0] = redirect;
		}
		
		console.log('here')
		
		commandFile = Redirect(redirects, commandFile);
	}
	
	console.log('commandFile: ', commandFile/*, ' redirects: ', redirects*/);
	
	// Found what command they want
	
	// Now run it
	
	var commandPath = path.join(__dirname, "./commands/" + commandFile.join('/') + '');
	
	console.log('commandPath: ', commandPath);
	
	path.exists(commandPath + '.js', function(exists) {
		console.log('exists: ', exists, ' args: ', args);
		if(exists && args.length > 1) {
			args = args.slice(1);
		}
		
		if(exists) {
			var code = /*fs.readFile(commandPath, function(err, code) {
					if(err) console.error(err);
		*/
					console.log('returned: ', require(commandPath).run(args));
			//});
		} else {
			return run(['create'], args);
		}
	});
	
	// Ran it
}
run(commandFile, argv);
