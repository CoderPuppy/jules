var fs = require('node-fs');
var path = require('path');
var falafel = require('falafel');

/* START merge */
var merge = function merge(dest, src, deep) {
	if(deep) return deepMerge(dest, src);
	
	Object.getOwnPropertyNames(src).forEach(function(name) {
		Object.defineProperty(dest, name, Object.getOwnPropertyDescriptor(src, name));
	});
	
	return dest;
};

var deepMerge = function deepMerge(dest, src) {
	Object.getOwnPropertyNames(src).map(function(name) {
		return { name: name, desc: Object.getOwnPropertyDescriptor(src, name) };
	}).map(function(desc) {
		if(typeof(desc.desc.get) === 'function') {
			return desc;
		} else {
			return {
				name: desc.name,
				desc: {
					writable: desc.desc.writable,
					enumerable: desc.desc.enumerable,
					configurable: desc.desc.configurable,
					value: deepMerge(desc.desc.value)
				}
			};
		}
	}).forEach(function(desc) {
		Object.defineProperty(dest, desc.name, desc.desc);
	});
	
	return dest;
};
/* END merge */

function read(input, tPath) {
	var output = {}, tmp;
	
	tPath = path.resolve(process.cwd(), tPath);
	
	for(var name in input) {
		tmp = input[name];
		
		if(typeof(tmp) === 'object') {
			output[name] = read(tmp, path.join(tPath, name));
		} else if(typeof(tmp) === 'string') {
			output[name] = fs.readFileSync(path.join(tPath, name)).toString();
		} else if(typeof(tmp) === 'function') {
			output[name] = tmp({
				base: tPath,
				file: path.join(tPath, name)
			}).toString();
		}
	}
	
	return output;
}

function apply(input, oPath, obj) {
	var tmp;
	
	oPath = path.resolve(process.cwd(), oPath);
	
	fs.mkdir(oPath, 0666, true, function(e) { if(e) throw e; });
	
	for(var name in input) {
		tmp = input[name];
		
		if(typeof(tmp) === 'string') {
			fs.writeFile(path.join(oPath, name), template(input[name], obj), function(e) { if(e) throw e; });
		} else if(typeof(tmp) === 'object') {
			apply(tmp, path.join(oPath, name));
		} else {
			console.warn('No handler for:', tmp);
		}
	}
}

var tags = {
	open: "<%",
	close: "%>",
	types: {
		value: '=',
		js: '',
		if: '?'
	}
}, open = {
	'(': ')',
	'{': '}',
	'[': ']'
}, close = {};

for(var key in open) {
	close[open[key]] = key;
}

function escapeJSString(str) {
	return str.replace(/[\\"']|[\n\t\r]/g, '\\$&');
}

function tag(open) {
	return Object.keys(tags.types).map(function(name) {
		return { name: name, open: tags.types[name] };
	}).filter(function(tag) {
		return open.slice(0, tag.open.length) === tag.open;
	}).sort(function(a, b) {
		return b.open.length - a.open.length;
	})[0];
}

/**	#Function parseJs
  *	#Desc A basic javascript parser just to find out if the javascript is complete
  *	#Arg str The javascript to parse
  *	#Arg state A state to restore
  *	#Returns A state which can be passed in again as the @state arg
  */
function parseJs(str, state) {
	state = state || {};
	var curIn = state.in ? state.in : [],
		inStr = typeof(state.str) !== 'undefined' ? Boolean(state.str) : false,
		i, cur;
	
	for(i = 0; i < str.length; i++) {
		cur = str[i];
		
		if(inStr) {
			if(inStr === cur && ( str[i - 1] !== '\\' || str[i - 2] === '\\' )) {
				inStr = false;
				curIn.splice(-1, 1);
			}
		} else {
			switch(cur) {
				/* start */
				case '{':
				case '(':
				case '[':
					curIn.push(cur);
					break;
				/* end */
				case '}':
				case ')':
				case ']':
					if(curIn[curIn.length - 1] === close[cur]) curIn.splice(-1, 1);
					break;
				/* string */
				case '"':
				case '\'':
					if(str[i - 1] !== '\\' || str[i - 2] === '\\') {
						curIn.push(cur);
						inStr = cur;
					}
					break;
			}
		}
	}
	
	return {
		in: curIn,
		str: inStr,
		code: str
	};
}

function parse(str) {
	var parts = [],
		inTag = false,
		startI = 0,
		endI = 0,
		i, cur, tagDef;
	
	for(i = 0; i < str.length; i++) {
		cur = str[i];
		
		if(inTag) {
			if(str.slice(i, i + tags.close.length) === tags.close) {
				 parts.push({
				 	type: tagDef.name,
				 	contents: str.slice(startI, i)
				 });
				 
				 inTag = false;
				 endI = i + tags.close.length;
			}
		} else {
			if(str.slice(i, i + tags.open.length) === tags.open) {
				tagDef = tag(str.slice(i + tags.open.length));
				
				if(i - endI > 0) {
					parts.push({
						type: 'output',
						contents: str.slice(endI, i)
					});
				}
				
				if(tagDef) {
					inTag = tagDef.name;
					startI = i + tags.open.length + tagDef.open.length;
				}
			}
		}
	}
	
	
	if(i - endI > 0) {
		parts.push({
			type: 'output',
			contents: str.slice(endI, i)
		});
	}
	
	return parts;
}

var startCode = fs.readFileSync(path.join(__dirname, 'template_start_code.js')).toString();
var endCode = fs.readFileSync(path.join(__dirname, 'template_end_code.js')).toString();

function makeCode(code) {
	return startCode + falafel(code, function(node) {
		if(node.type === 'FunctionExpression' && node.parent.type === 'CallExpression') {
			node.body.update('{ return __capture(function() ' + node.body.source() + '); }');
		}
	}) + endCode;
}

function compile(parts) {
	var code = '',
		prevParsed;
	
	parts.forEach(function(part) {
		if(part.type === 'output') {
			code += 'print("' + escapeJSString(part.contents) + '");';
		} else if(part.type === 'value') {
			code += 'print(';
			parsed = parseJs(part.contents, prevParsed);
			
			if(parsed.in.length) {
				code += prevParsed ? part.contents : part.contents.trimLeft();
				prevParsed = parsed;
			} else {
				code += ( prevParsed ? part.contents.trimRight() : part.contents.trim() ).replace(/[\;\s]*$/, '') + ');';
				prevParsed = undefined;
			}
		} else if(part.type === 'if') {
			if(part.contents.trim() === 'end') {
				code += ' }';
			} else {
				code += 'if(' + part.contents.trim().replace(/[\;\s]*$/, '') + ') { ';
			}
		} else if(part.type === 'js') {
			code += part.contents;
			
			if(prevParsed) {
				code = code.trimRight().replace(/[\;\s]*$/, '') + ');';
				prevParsed = undefined;
			}
		}
	});
	
	return new Function('__obj', makeCode(code));
}

function template(t, o) {
	return compile(parse(t))(o);
}

exports.compile = compile;
exports.parse = parse;
exports.template = template;
exports.apply = apply;
exports.read = read;
