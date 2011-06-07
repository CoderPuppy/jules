exports.wrap = function wrap(func, start, end) {
	if(typeof func == "string")
		return arguments.callee(new Function(func), start, end);
	var funcTested = funcRegExp.exec(func.toString());
	return (Function.apply(Function, _.map(funcTested[1].split(','), function(param) {return _.trim(param);}).concat([start + funcTested[2] + end])));
}
