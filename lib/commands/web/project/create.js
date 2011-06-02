var fs            = require('fs'),
		child_process = require('child_process');

// console.log('create');
		
var	path = require('path'),
		projStruct = {
			"app": {
				"controllers": {},
				"models": {},
				"views": {},
				"helpers": {},
				"assets": {}
			},
			"config": {},
			"public": {
				"js": {},
				"css": {},
				"pics": {},
				"err": {}
			},
			"db": {},
			"tmp": {}
		},
		files = {
			"config/app.jl": "config/app.jl",
			"config/env.jl": "config/env.jl",
			"config/dev.jl": "config/dev.jl",
			"config/pro.jl": "config/production.jl",
			"config/test.jl": "config/test.jl",
			"config/routes.jl": "config/routes.jl"
		};

// console.log('struct: ', structure);
		
function mkdir(dir, callback) {
	// console.log('dir: ', dir);
	
	return child_process.spawn('mkdir', 
		[dir]).on('exit', callback);
}

function cmd(command) {
	return child_process.spawn('cmd.exe',
		['/c', command]);
}

function mkStructDir(struct, base, key) {
	// console.log('key: ', key);
	mkdir(newBasePath = path.join(base, key), function() {
			// console.log('struct[key]: ', struct[key], ' key: ', key);
			if(typeof struct[key] == "object") {
				structure(path.join(base, key), struct[key]);
			}
	});
}

function loadFile(file, files) {
	// console.log('file: ', file, ' path: ', files[file]);
	fs.readFile(path.resolve(__dirname, '../../../tmpl/', files[file]), function(err, code) {
			if(err) console.error(err); process.exit(1);
			// console.log('path: ', path.resolve(process.cwd(), './' + file));
			createAndWrite(path.resolve(process.cwd(), './' + file), code.toString());
	});
}

function loadFiles(files) {
	for(file in files) {
		// console.log('files: ', fs.readdirSync('.'), ' file: ', file, ' path: ', path.resolve(process.cwd(), './' + file));
		createAndWrite(path.resolve(process.cwd(), './' + file), fs.readFileSync(path.resolve(__dirname, '../../../tmpl/', files[file])).toString());
	}
}

function structure(base, struct) {
	var newBasePath = base;
	// console.log('base: ', base, ' struct: ', struct);
	for(key in struct) {
		mkStructDir(struct, base, key);
	}
	
	return base;
}

function createAndWrite(path, data, callback) {
	// console.log('path: ', path);
	
	cmd('touch "' + path + '"').on('exit', function() {
			// console.log('here now');
			fs.writeFile(path, data, callback);
		});
}

function buildStructure(projName) {
	structure(process.cwd(), projStruct);
	
	fs.writeFile(path.join(process.cwd(), './public/index.html'), "<html>\n\t<head>\n\t\t<title>\n\t\t\t" + (projName || 'Untitled') + "\n\t\t</title>\n\t</head>\n\t<body>\n\t\t\n\t</body>\n</html>")
	fs.writeFile(path.join(process.cwd(), './project.json'), JSON.stringify({
		name: projName || path.basename(process.cwd),
		version: 1
	});
	
	loadFiles(files);
}

exports.run = function run(args) {
	var projName = args[0];
	
	if(projName) {
		mkdir(projName, function() {
				process.chdir(projName);
				buildStructure(projName);
		});
	} else {
		buildStructure();
	}
	
	
};
