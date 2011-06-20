var path  = require('path'),
		Class = require(path.resolve(__dirname, '../../../class')).Class;

exports.MW = new Class(function mw(app) {
	this.app = app;
}, {
	run: function(env) {
		return this.app.run(env);
	}
});
