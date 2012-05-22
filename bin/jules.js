#!/usr/bin/env node
/*var celeri = require('celeri');*/
var program = require('commander');
var n = require('natives');
var path = n.path;

var commands = require(path.join(__dirname, '../lib/commands'));

commands.add(function() {
	commands.add(program);
	
	/*celeri.open();
	celeri.parse(process.argv, function(e, cmd) {
		if(e) throw e;
	});*/
	
	program.parse(process.argv);
});
