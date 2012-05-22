var n = require('natives');
var fs = n.fs;
var path = n.path;

var commands = {}, loaded, cbs = [];

function runCb() {
	loaded = true;
	cbs.forEach(function(cb) {
		cb();
	});
}

function readCommands(path) {
	if(typeof(path) === 'string') path = [ path ];
	
	var baseDir = n.path.resolve.apply(n.path, [ __dirname ].concat(path));
	
	fs.readdir(baseDir, function(e, files) {
		files.forEach(function(name, i) {
			fs.stat(n.path.join(baseDir, name), function(e, stat) {
				if(e) throw e;
				
				if(stat.isDirectory()) {
					readCommands(path.join(baseDir, name));
				} else if(stat.isFile() && /\.js$/.test(name)) {
					commands[path.concat([ name.replace(/\.js$/, '') ]).join(':')] = require(n.path.join(baseDir, name));
				}
				
				if(i === files.length - 1) {
					runCb();
				}
			});
		});
	});
}

readCommands('commands');

function add(celeri) {
	if(typeof(celeri) === 'function') {
		if(loaded) celeri();
		else cbs.push(celeri);
		
		return;
	}
	if(!loaded) try { throw new Error(); } catch(e) { console.warn('not yet loaded', e.stack); return; };
	
	for(var name in commands) {
		commands[name](celeri);
	}
	
	/*celeri.option({
		command: 'exit',
		desciption: 'Exit the mini shell'
	}, function() {
		process.exit();
	});*/
	
	return celeri;
}

exports.add = add;
