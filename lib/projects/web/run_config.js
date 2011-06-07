var path  = require('path'), 
		Class = require(path.resolve(__dirname, '../../class')).Class;

exports.Config = new Class(function(env) {
	this.env = env;
}, {
	"env": "dev",
	"log_level": 5,
	"useHttps": false
});
