var path       = require('path'),
		jlRunner   = require(path.resolve(__dirname, '../../../utils/jlRunner')),
		Class      = require(path.resolve(__dirname, '../../../class')).Class,
		startTagRe = /\<\%(\=)?/,
		endTagRe   = /(\-)?\%\>/;

function matchTag(tmpl, curIndex) {
	var tag        = {},
			startMatch = tmpl.matchIndex(startTagRe, curIndex),
			startIndex = startMatch ? startMatch.index : -1,
			endMatch   = tmpl.matchIndex(endTagRe, startIndex),
			endIndex   = endMatch ? endMatch.index : -1;
	
		
	if(startIndex == -1 || endIndex == -1 || !(startMatch.match || endMatch.match)) {return undefined;}
	
	tag.index       = startIndex;
	tag.type        = (startMatch.match[1] == '=' ? 'var' : 'js');
	tag.NWS         = (endMatch.match[1] == '-' ? true : false);
	var endOfStartI = startIndex + startMatch.match[0].length;	
	tag.contents    = tmpl.substr(endOfStartI, endIndex - endOfStartI);
	tag.endIndex    = endIndex + endMatch.match[0].length;
	
	return tag;
}

function getCode(tag, tmpl) {
	switch(tag.type) {
		case 'var':
			return (tag.NWS ? '' : 'echo(" ");') + 'echo(' + tag.contents.trim() + ');' + (tag.NWS ? '' : 'echo(" ");');
			break;
		case 'js':
			return (tag.NWS ? '' : 'echo(" ");') + tag.contents.trim() + ';' + (tag.NWS ? '' : 'echo(" ");');
			break;
	}
}

exports.Template = new Class(function Template(tmpl) {
	var match    = tmpl.matchIndex(startTagRe),
			index    = match ? match.index : tmpl.length,
			txt      = tmpl.substr(0, index),
			code     = 'var out="";function echo(){var args=arguments;for(var i=0;i<args.length;i++){out+=args[i];}};',
			curIndex = (index - 1) || -1;
	
	if(txt.length > 0) {code += 'echo("' + txt.jStringEscape() + '");';}
	
	while(tag = matchTag(tmpl, curIndex)) {
		if(tag.index !== undefined && tag.index !== null && tag.index != -1) {curIndex = tag.index;} else {break;}
		code += getCode(tag, tmpl);
		
		curIndex = tag.endIndex;
		
		match = tmpl.matchIndex(startTagRe, curIndex - 1);		
		index = match ? match.index : tmpl.length;
		
		txt   = tmpl.substr(curIndex, index - curIndex);
		
		if(txt.length > 0) {code += 'echo("' + txt.jStringEscape() + '");';}
	}
	
	return jlRunner.runSync("(new Function('context','context=context||{};with(context) {" + code.jStringEscape() + "return out;}'))");
});

exports.getTemplate = function getTemplate(tmpl){return new exports.Template(tmpl);};

String.prototype.trim = function() {return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
String.prototype.jStringEscape=function(){return this.replace(/([\"\'\\])/g,'\\$1').replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t');};
Array.prototype.unique=function(){var array=this,has={},i=array.length-1;for(;i>=0;i--){if(has[array[i]]){array.splice(i,1);}else{has[array[i]]=true;}}return array;};
String.prototype.matchIndex=function(re,startIndex){if(startIndex===undefined){startIndex=-1}var modifiers=re.toString().split('/')[2].split('');modifiers.push('g');modifiers.unique();var regex=new RegExp(re.toString().split('/')[1],modifiers.join()),match,prevIndex=startIndex,currIndex,matches=[],rtnData=undefined,breakNow=false,prevCurrIndex;while(match=regex.exec(this)){currIndex=this.indexOf(match[0],prevIndex);matches.push({match:match,index:currIndex});if(currIndex==prevCurrIndex){breakNow=true;}prevIndex=regex.lastIndex;prevCurrIndex=currIndex;if(breakNow){break;}}for(var i=0;i<matches.length;i++){match=matches[i];if(match.index>startIndex){rtnData=match;break;}};return rtnData;};
