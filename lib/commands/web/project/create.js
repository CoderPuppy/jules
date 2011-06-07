var fs            = require('fs'),
		child_process = require('child_process'),
		path          = require('path'),
		projStruct    = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../projects/web/structure.json'))),
		spawn         = child_process.spawn;

function log() {
	console.log.apply(console, arguments);
	return arguments.length > 0 ? (arguments.length > 1 ? arguments : arguments[0]) : null;
}

function mkdir(dir, callback) {
	return child_process.spawn('mkdir', 
		[dir]).on('exit', callback);
}

function cmd(command) {
	return child_process.spawn('cmd.exe',
		['/c', command]);
}

function run(command) {
	return child_process.exec(command);
}

function mkdir(dir, callback) {
	spawn('mkdir', [dir]).on('exit', callback);
}

function getPath(file) {
	return path.resolve(process.cwd(), file);
}

function getTmplPath(file) {
	return path.resolve(__dirname, '../../../projects/web/tmpl', file);
}

function mkStructDir(base, dirName, struct) {
	var dirPath = path.resolve(base, dirName);
	
	mkdir(dirPath, function() {
			structure(dirPath, struct);
	});
}

function mkStructFile(base, fileName, filePointer) {
	var filePath = path.resolve(base, fileName);
	
	fs.readFile(getTmplPath(filePointer), function(er, code) {
		if(er) throw er;
		
		fs.writeFile(filePath, code, function(er) {
			if(er) throw er;
		});
	});
}

function structure(base, struct) {
	for(file in struct) {
		if(typeof(struct[file]) == 'object') {
			mkStructDir(base, file, struct[file]);
		} else if(typeof(struct[file]) == 'string') {
			mkStructFile(base, file, struct[file]);
		}
	}
}

function buildStructure(projName) {
	var base = process.cwd();
	
	structure(base, projStruct);
	
	fs.writeFile(getPath('public/index.html'), "<html>\n\t<head>\n\t\t<title>" + projName + "</title>\n\t<body>\n\t\t\n\t</body>\n</html>");
	fs.writeFile(getPath('project.json'), JSON.stringify({
		"name": projName,
		"version": 1
	}));
}

exports.run = function(args) {
	if(args.length >= 1) {
		mkdir(path.resolve(args[0]), function() {
			process.chdir(path.resolve(args[0]));
			buildStructure(path.basename(args[0]));
		});
	} else {
		buildStructure(path.basename(process.cwd()));
	}
}
