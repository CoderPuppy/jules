var path = require('path'),
		jlRunner = require(path.resolve(__dirname, '../../../utils/', 'jlRunner'));

function switchToMainDir() {
	while(!path.existsSync(path.resolve(process.cwd(), 'project.json'))) {
		process.chdir('../');
	}
}

exports.run = function run(args) {
	switchToMainDir();
}
