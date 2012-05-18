var fs = require('node-fs');
var path = require('path');

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

function apply(input, oPath) {
	var tmp;
	
	oPath = path.resolve(process.cwd(), oPath);
	
	fs.mkdir(oPath, 0666, true, function(e) { if(e) throw e; });
	
	for(var name in input) {
		tmp = input[name];
		
		if(typeof(tmp) === 'string') {
			fs.writeFile(path.join(oPath, name), function(e) { if(e) throw e; });
		} else if(typeof(tmp) === 'object') {
			apply(tmp, path.join(oPath, name));
		} else {
			console.warn('no handler for:', tmp);
		}
	}
}

var tags = {
	open: "<%",
	close: "%>",
	types: {
		js: {
			name: 'js',
			open: '',
			close: '',
			compile: function(contents) {
				return contents.trim();
			}
		},
		value: {
			name: 'value',
			open: '=',
			close: '',
			compile: function(contents) {
				return 'print(' + contents.trim() + ');';
			}
		},
		if: {
			name: 'if',
			open: '?',
			close: '',
			compile: function(contents) {
				return 'if(' + contents.trim() + ') {';
			},
			end: {
				contents: 'end',
				compile: function() {
					return '}';
				}
			}
		}
	}
}, tagNames = Object.keys(tags.types);

function endTag(tag) {
	return merge({
		open: tag.open,
		close: tag.close,
		name: tag.name
	}, tag.end);
}

function findOpenTag(open) {
	return tagNames.map(function(name) {
		return tags.types[name];
	}).map(function(tag) {
		if(tag.end) {
			console.log('end tag:', endTag(tag));
			return [ tag, endTag(tag) ];
		} else {
			return [ tag ];
		}
	}).reduce(function(a, b) {
		return a.concat(b);
	}).filter(function(tag) {
		return open.slice(0, tag.open.length) === tag.open;
	}).filter(function(tag) {
		if(typeof(tag.contents) === 'string') {
			return open.slice(tag.open.length).trimLeft().slice(0, tag.contents.length) === tag.contents;
		} else {
			return true;
		}
	}).sort(function(a, b) {
		var index = b.open.length - a.open.length;
		
		if(typeof(a.contents) === 'string') {
			index = -1;
		}
		if(typeof(b.contents) === 'string') {
			index = 1;
		}
		if(typeof(a.contents) === 'string' && typeof(b.contents) === 'string') {
			index = 0;
		}
		
		return index;
	})[0];
}

function findCloseTag(close, inTag) {
	if(close.slice(0, tags.types[inTag].close.length + tags.close.length) === tags.types[inTag].close + tags.close) {
		return tags.types[inTag];
	}
}

function escapeJSString(str) {
	return str.replace(/[\\ntr"']/g, '\\$&');
}

function parse(str) {
	var parts = [],
		i;
	
	for(i = 0; i < str.length; i++) {
		cur = str[i];
		
		if(inTag) {
			if(findCloseTag(str.slice(i), inTag)) {
				// close tag
				
				body += tagDef.compile(str.slice(startTag, i - 1));
				
				parts.push({
					type: tagDef.name
				});
				
				endTag = i + tagDef.close.length + tags.close.length;
				
				inTag = false;
			}
		} else {
			if(str.slice(i, i + tags.open.length) === tags.open) {
				// open tag
				
				tag = str.slice(i + tags.open.length);
				
				tagDef = findOpenTag(tag);
				
				if(tagDef) {
					inTag = tagDef.name;
					
					startTag = i + tags.open.length + tagDef.open.length;
					
					if(i - endTag > 0) {
						parts.push({
							type: 'print',
							value: str.slice(endTag, i)
						});
					}
				}
			}
		}
	}
	
	return parts;
}

function compile(str) {
	var body = '',
		inTag = false,
		i, cur, tag, tagDef, startTag = 0, endTag = 0;
	
	for(i = 0; i < str.length; i++) {
		cur = str[i];
		
		if(inTag) {
			if(findCloseTag(str.slice(i), inTag)) {
				// close tag
				
				body += tagDef.compile(str.slice(startTag, i - 1));
				
				endTag = i + tagDef.close.length + tags.close.length;
				
				inTag = false;
			}
		} else {
			if(str.slice(i, i + tags.open.length) === tags.open) {
				// open tag
				
				tag = str.slice(i + tags.open.length);
				
				tagDef = findOpenTag(tag);
				
				if(tagDef) {
					inTag = tagDef.name;
					
					startTag = i + tags.open.length + tagDef.open.length;
					
					if(i - endTag > 0) {
						body += 'print("' + escapeJSString(str.slice(endTag, i)) + '");';
					}
				}
			}
		}
	}
	
	if(( i - 1 ) - endTag > 0) {
		body += 'print("' + escapeJSString(str.slice(endTag, i)) + '");';
	}
	
	return new Function('context', 'var o="";function print(){o+=[].slice.call(arguments, 0).join(" ");}with(context){' + body + '}');
}

exports.read = read;
exports.apply = apply;
exports.compile = compile;
exports.parse = parse;
