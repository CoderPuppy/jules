var path          = require('path'),
		fs            = require('fs'),
		child_process = require('child_process'),
		jlRunner      = require(path.resolve(__dirname, 'utils', 'jlRunner')),
		jake          = require(path.resolve(__dirname, 'utils/jake/lib/', 'jake')),
		parseopts     = {},
		context       = {},
		args          = process.argv.slice(2),
		exists        = function (jakefile) {
			var cwd = process.cwd();
			
			if (path.existsSync(path.resolve(cwd, jakefile + '.jl'))) {
				return true;
			}
			process.chdir("..");
			if (cwd === process.cwd()) {
				return false;
			}
			return exists(jakefile);
		};

for(key in jake.api) {
	context[key] = jake.api[key];
}

context.run = function(prog, args, options, cb) {
	var execStr = prog;
	
	if(typeof(args) == "function") {
		cb      = args;
		args    = []  ;
		options = {
			cwd: process.cwd()
		};
	}
	
	if(typeof(options) == "function") {
		cb      = options;
		options = {
			cwd: process.cwd()
		};
	}
	
	cb = cb || function(){};
	args = args || [];
	
	args = args.map(function(arg) {
		return arg.toString().replace(/"/g, '\\"');
	});
	
	if(args.length > 0) {
		execStr += " " + args.join(' ');
	}
	
	child_process.exec(execStr, options, cb);
};

var usage = ''
    + 'Jules-Jake JavaScript build tool\n'
    + '********************************************************************************\n'
    + 'If no flags are given, Jules-Jake looks for a Jakefile.jl in the current directory.\n'
    + '********************************************************************************\n'
    + '{Usage}: jake [options] target (commands/options ...)\n'
    + '\n'
    + '{Options}:\n'
    + '  -f, --jakefile FILE        Use FILE as the Jakefile\n'
    + '  -C, --directory DIRECTORY  Change to DIRECTORY before running tasks.\n'
    + '  -T, --tasks                Display the tasks, with descriptions, then exit.\n'
    + '  -h, --help                 Outputs help information\n'
    + '  -V, --version              Outputs Node-Jake version\n'
    + '';

/**
 * @constructor
 * Parses a list of command-line args into a key/value object of
 * options and an array of positional commands.
 * @ param {Array} opts A list of options in the following format:
 * [{full: 'foo', abbr: 'f'}, {full: 'bar', abbr: 'b'}]]
 */
parseopts.Parser = function (opts) {
  // Positional commands parse out of the args
  this.cmds = [];
  // A key/value object of matching options parsed out of the args
  this.opts = {};

  // Data structures used for parsing
  this.reg = [];
  this.shortOpts = {};
  this.longOpts = {};

  var item;
  for (var i = 0, ii = opts.length; i < ii; i++) {
    item = opts[i];
    this.shortOpts[item.abbr] = item.full;
    this.longOpts[item.full] = item.full;
  }
  this.reg = opts;
};

parseopts.Parser.prototype = new function () {

  /**
   * Parses an array of arguments into options and positional commands
   * Any matcthing opts end up in a key/value object keyed by the 'full'
   * name of the option. Any args that aren't passed as options end up in
   * an array of positional commands.
   * Any options passed without a value end up with a value of null
   * in the key/value object of options
   * If the user passes options that are not defined in the list passed
   * to the constructor, the parser throws an error 'Unknown option.'
   * @param {Array} args The command-line args to parse
   */
  this.parse = function (args) {
    var cmds = []
      , opts = {}
      , arg
      , argName
      , argItems;

    while (args.length) {
      arg = args.shift();
      if (arg.indexOf('--') == 0) {
        argItems = arg.split('=');
        argName = this.longOpts[argItems[0].substr(2)];
        if (argName) {
          // If there's no attached value, value is null
          opts[argName] = argItems[1] || true;
        }
        else {
          throw new Error('Unknown option "' + argItems[0] + '"');
        }
      }
      else if (arg.indexOf('-') == 0) {
        argName = this.shortOpts[arg.substr(1)];
        if (argName) {
          // If there is no following item, or the next item is
          // another opt, value is null
          opts[argName] = (!args[0] || (args[0].indexOf('-') == 0)) ?
              true : args.shift();
        }
        else {
          throw new Error('Unknown option "' + arg + '"');
        }
      }
      else {
        cmds.push(arg);
      }
    }

    this.cmds = cmds;
    this.opts = opts;
  };

};

optsReg = [
  { full: 'directory'
  , abbr: 'C'
  }
, { full: 'jakefile'
  , abbr: 'f'
  }
, { full: 'tasks'
  , abbr: 'T'
  }
, { full: 'help'
  , abbr: 'h'
  }
, { full: 'version'
  , abbr: 'V'
  }
];

Parser = new parseopts.Parser(optsReg);
parsed = Parser.parse(args);
opts = Parser.opts;
cmds = Parser.cmds;
taskName = cmds.shift();
dirname = opts.directory || process.cwd();
process.chdir(dirname);
taskName = taskName || 'default';

jakefile = opts.jakefile ?
    opts.jakefile.replace(/\.jl$/, '') : 'Jakefile';

if (opts.help) {
  jake.die(usage);
}

if (opts.version) {
  jake.die(JAKE_VERSION);
}

if (!exists(jakefile)) {
  jake.die('Could not load Jakefile.\nIf no Jakefile specified with -f or --jakefile, ' +
      'jake looks for Jakefile.jl in the current directory ' +
      'or one of the parent directories.');
}

try {
  tasks = jlRunner.require(path.join(process.cwd(), jakefile), context);
}
catch (e) {
  if (e.stack) {
    console.log(e.stack);
  }
  jake.die('Could not load Jakefile: ' + e);
}


process.addListener('uncaughtException', function (err) {
  console.log('jake aborted.');
  if (err.stack) {
    console.log(err.stack);
  }
});

jake.parseAllTasks();

if (opts.tasks) {
  jake.showAllTaskDescriptions();
}
else {
  jake.args = cmds;
  jake.runTask(taskName, true);
}
