var path  = require('path'),
		Class = require(path.resolve(__dirname, '../../../class')).Class,
		sys   = require('sys'),
		tagRe = /\{(\{|\%)/g,
		ends = {
			"{": "}",
			"{{": "}}",
			"%": "%"
		};
function extend(a, b) {
	for(key in b) {
		a[key] = b[key];
	}
	return a;
}
String.prototype.trim = function() {return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
String.prototype.jStringEscape = function() {
	return this.replace(/(["'\\])/g, '\\$1').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
};
var Template = new Class(function(tmpl) {
	var match = tmpl.matchIndex(tagRe),
			index = match && match.index !== -1 ? match.index : tmpl.length,
			txt   = tmpl.substr(0, index),
			data,
			tag;
	
	
	this.parts = [];
	if(txt.length > 0) {
		this.parts.push({
			"type": "text",
			"data": txt
		});
	}
	while((tag = matchTag(tmpl, tag ? tag.endIndex : -1)) !== undefined) {
		switch(tag.open) {
			case "{":
				data = {
					"type": "expr",
					"data": parseExpr(tag.contents)
				};
				break;
			case "%":
				data = {
					"type": "tag",
					"data": {}
				};
				var pTag = parseTag(data, tag, tmpl, tag.index);
				data.data = pTag.tag;
				if(pTag.index) i = pTag.index;
				break;
		}
		if(data) this.parts.push(data);
		if(i !== undefined) tag.endIndex = i;
		matchTxt = tmpl.matchIndex(tagRe, tag.endIndex);
		txt = tmpl.substr(tag.endIndex, (matchTxt ? (matchTxt.index != -1 ? matchTxt.index : tmpl.length) : tmpl.length) - tag.endIndex);
		if(txt.length > 0) {
			this.parts.push({
				"type": "text",
				"data": txt
			});
		}
	}
}, {
	"parts": [],
	"render": function render(context) {
		var parts = this.parts,
				out   = "",
				part;
		for(var i = 0; i < parts.length; i++) {
			part = parts[i];
			switch(part.type) {
				case "expr":
					out += part.data.resolve(context);
					break;
				case "tag":
					out += part.data.render(context);
					break;
				case "text":
					out += part.data;
					break;
			}
		}
		return out;
	}
});
function parseExpr(string, filters) {
  var match = exprStartRegExp.exec(string);
  if (!match)
    throw Error(
      'Expr does not start with primary: ' + base.repr(string));
  var i = findSignificant(match);
  base.assert(i != -1);
  var result = makePrimaryExpr(match[i], i - 1);

  var re = new RegExp(filterRegExp);
  re.lastIndex = match[0].length;
  while ((match = utils.nextMatch(re, string, TemplateSyntaxError))) {
    var filter = filters[match[1]];
    if (!filter)
      throw TemplateSyntaxError('Invalid filter: ' + base.repr(match[1]));
    var arg = undefined;
    i = findSignificant(match, 2);
    if (i != -1)
      arg = makePrimaryExpr(match[i], i - 2);
    result = new FilterExpr(filter, result, arg);
    doneIndex = re.lastIndex;
  }
  return result;
}

exports.parseExpr = parseExpr;

function parseTag(data, theTag, tmpl, tmplIndex) {
	var trimed  = theTag.contents.trim(),
			split   = trimed.split(' ')
			tagName = split[0],
			tag     = exports.tags[tagName],
			parser  = {
				"content": trimed,
				"parse": function(until) {
					until = until || [];
					var re    = new RegExp('\\{\\%\\s\\s*(?:' + until.join('|') + ')\\s\\s*\\%\\}'),
							match = tmpl.matchIndex(re, theTag.endIndex),
							index = (match ? match.index || tmpl.length : tmpl.length);
					tmplIndex = index;
					return new Template(tmpl.substr(theTag.endIndex, index - theTag.endIndex));
				},
				"makeExpr": function(expr){return parseExpr(expr);},
				"makeExprs": function (strings) {return strings.map(this.makeExpr, this);}
			};
	if(!tag) console.error('no such tag: ', tagName);
	return {
		"tag": tag(parser, data),
		"index": tmplIndex
	};
}
exports.tagRe = tagRe;
Array.prototype.unique = function() {
	var has = {}, i = this.length - 1;
	for(; i >= 0; i--) {
		if(has[this[i]]) {
			this.splice(i, 1);
		} else {
			has[this[i]] = true;
		}
	}
	return this;
};
String.prototype.matches = function(re) {
	var modifiers = re.toString().split('/')[2].split('');
	modifiers.push('g');
	modifiers.unique();
	var regex = new RegExp(re.toString().split('/')[1],
			modifiers.join()),
			match,
			prevIndex = startIndex,
			currIndex,
			matches = [],
			rtnData = undefined,
			breakNow = false,
			prevCurrIndex;
	
	while (match = regex.exec(this)) {
		currIndex = this.indexOf(match[0], prevIndex);
		if(currIndex === undefined || currIndex === null || currIndex == -1) {continue;}
		matches.push({
			"match": match,
			"index": currIndex
		});
		if(currIndex == prevCurrIndex) {breakNow = true;}
		prevIndex = regex.lastIndex;
		prevCurrIndex = currIndex;
		if(breakNow) {break;}
	}
	
	return matches;
};
String.prototype.matchIndex = function(re, startIndex) {
	if(startIndex === undefined) {
		startIndex = -1
	}
	
	var matches = this.matches(re);
	
	for(var i = 0; i < matches.length; i++) {
		match = matches[i];
		if(match.index > startIndex) {
			rtnData = match;
			break;
		}
	}
	return rtnData;
};
exports.matchIndex = String.prototype.matchIndex;
function matchTag(tmpl, index) {
	var matched = tmpl.matchIndex(tagRe, index),
			rtnData = undefined,
			i,
			curChar,
			breakNow = false;
	if(matched !== undefined) {
		rtnData = {
			"open": matched.match[1],
			"index": matched.index,
			"contents": ""
		};
		i = rtnData.index + rtnData.open.length + 1;
		while(!breakNow && i <= tmpl.length) {
			curChar = tmpl.charAt(i);
			if(tmpl.substr(i, ends[rtnData.open].length) == ends[rtnData.open]) {
				breakNow = true;
				rtnData.close = ends[rtnData.open];
			} else {
				rtnData.contents += curChar;
			}
			i++
		}
		rtnData.fullTag = "{" + rtnData.open + rtnData.contents + rtnData.close + "}";
		rtnData.endIndex = rtnData.index + rtnData.fullTag.length;
	}
	return rtnData;
}
exports.matchTag = matchTag;
exports.getTemplate = function getTemplate(tmpl) {return new Template(tmpl);}
exports.tags = {};
exports.filters = {};
function repr(value) {return sys.inspect(value);}
var ForNode = new Class(
  function (name, expr, reversed, bodyNode, emptyNode, data) {
    this._name = name;
    this._expr = expr;
    this._reversed = reversed;
    this._bodyNode = bodyNode;
    this._emptyNode = emptyNode;
    this.__TMPL__DATA__ = data;
  },
  {
    render: function (context) {
      var sequence = this._expr.resolve(context);
			var bits = [];
			var data = this.__TMPL__DATA__;
      if (!sequence || !sequence.length)
        return this._emptyNode ? this._emptyNode.render(context) : '';
      if(Object.prototype.toString.call(sequence) == '[object Array]') {
				if (this._reversed) {
					if (typeof(sequence) == 'string' || sequence instanceof String)
						sequence = sequence.split('');
					Array.reverse(sequence);
				}
				for (var i = 0; i < sequence.length; ++i) {
					var subcontext = {__proto__: context};
					subcontext[this._name] = sequence[i];
					subcontext.forloop = {
						"parentloop": context.forloop,
						"counter": i + 1,
						"counter0": i,
						"revcounter": sequence.length - i,
						"revcounter0": sequence.length - i - 1,
						"first": i == 0,
						"last": i == sequence.length - 1
					};
					bits.push(this._bodyNode.render(subcontext));
				}
      } else {
				for (key in sequence) {
					var subcontext = {__proto__: context};
					subcontext[this._name] = key;
					subcontext.forloop = {
						"key": key,
						"data": sequence[key],
						"parentloop": context.forloop
					};
					bits.push(this._bodyNode.render(subcontext));
				}
      }
      return bits.join('');
    }
  });
exports.tags['for'] = function (parser, data) {
  var match = (/^for\s+(\w+)\s+in\s+(.*?)(\s+reversed)?$/
               .exec(parser.content));
  if (!match)
    throw Error(
      '"for" tag should use the format ' +
        '"for <letters, digits or underscores> in <expr> [reversed]": ' +
        repr(parser.content));
  var bodyNode = parser.parse(['empty', 'endfor']);
  var emptyNode;
  if (parser.content == 'empty')
    emptyNode = parser.parse(['endfor']);
  return new ForNode(match[1], parser.makeExpr(match[2]), !!match[3],
                     bodyNode, emptyNode, data);
};
