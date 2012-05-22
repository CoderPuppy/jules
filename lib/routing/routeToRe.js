var XRegExp = require('xregexp');

RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

var routeToRe = module.exports = function routeToRe(route) {
	var reStr = '^',
		nesting = 0,
		path = route.path,
		reqs = route.requirments || {},
		i, cur, name;
	
	for(i = 0; i < path.length; i++) {
		cur = path[i];
		
		switch(cur) {
			case '(': // another level of nesting
				nesting++;
				reStr += '(?:';
				break;
			case ')': // -one level of nesting
				nesting--;
				reStr += ')?';
				break;
			case ':': // variable
				match = /^([\w\d]*)/g.exec(path.slice(i + 1));
				if(match) {
					name = match[1];
					if(name) {
						i += name.length;
						reStr += '(<' + name + '>';
						if(reqs[name]) {
							reStr += reqs[name];
						} else {
							reStr += '[\\w\\d]*';
						}
						
						reStr += ')';
					}
				}
				break;
			default:
				reStr += RegExp.escape(cur);
				break;
		}
	}
	
	reStr += '$';
	
	return XRegExp(reStr);
};
