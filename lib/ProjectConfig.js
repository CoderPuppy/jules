var path  = require('path'),
		fs    = require('fs'),
		Class = require(path.resolve(__dirname, 'class')).Class;

exports.ProjectConfig = new Class(function() {
	if(!path.existsSync(path.resolve(process.cwd(), 'project.json'))) {
		throw new Error("Current directory is not a Jules project");
	}
	
	return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'project.json')) + '');
});
