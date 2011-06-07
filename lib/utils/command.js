var path          = require('path'),
		fs            = require('fs'),
		redirects     = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../redirects.json')) + ''),
		starRedirects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../starRedirects.json')) + '');

exports.resolve = function resolve(splitCommand) {
	if(typeof splitCommand == 'string')
		splitCommand = splitCommand.split(':');
	
	var redirect   = redirects[splitCommand[0]],
		starRedirect = starRedirects[splitCommand[0]];
	
	if(splitCommand.length == 1 && starRedirect) {
		splitCommand[0] = starRedirect;
		if(typeof starRedirect == "object") {
			splitCommand.splice.apply(splitCommand, [0, 1].concat(starRedirect));
		} else {
			splitCommand[0] = starRedirect;
		}
		
		splitCommand = exports.resolve(splitCommand);
		
		return splitCommand;
	}
	
	if(redirect !== undefined) {
		if(typeof redirect == "object") {
			splitCommand.splice.apply(splitCommand, [0, 1].concat(redirect));
		} else {
			splitCommand[0] = redirect;
		}
		
		return exports.resolve(splitCommand);
	} else {
		return splitCommand;
	}
}
