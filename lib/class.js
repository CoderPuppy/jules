function copy(obj) {
	var copyed, type = Object.prototype.toString.call(obj);
	
	if(type == '[object Object]' || type == '[object Function]') {
		copyed = {};
		
		for(key in obj) {
			copyed[key] = obj[key];
		}
	} else if(Object.prototype.toString.call(obj) == '[object Array]') {
		copyed = [];
		
		for(var i = 0; i < copyed.length; i++) {
			copyed[i] = obj[i];
		}
	}
	
	return copyed || obj;
}

function globalExtend(obj, extender) {
	for(key in extender) {
		obj[key] = extender[key];
	}
	
	return obj;
}

function makeFromFunc(fn, proto) {
	globalExtend(fn.prototype, proto);
	
	fn.supers = [];
	
	fn.subClass = function subClass(constructor, proto) {				
		return (new exports.Class(constructor, proto)).extend(this);
	}
	
	fn.extend = function extend(classObj) {
		var newPrototype;
		
		if(typeof classObj == 'string')
			classObj = global[classObj];
		
		if(classObj.prototype !== undefined && classObj.prototype !== null)
			newPrototype = copy(classObj.prototype);
		else
			newPrototype = copy(classObj);
		
		globalExtend(newPrototype, this.prototype);
		
		this.prototype = newPrototype;
		
		this.supers.push(classObj);
		
		return this;
	}
	
	fn.Static = function Static(prop, val) {
		if(typeof prop == "object") {
			for(key in prop) {
				this.Static(key, prop[key]);
			}
		} else {
			this[prop] = val;
		}
		
		return this;
	}
	
	fn.prototype.SUPER = function(func) {
		if(typeof func == 'function')
			return this;
		
		for(var i = 0; i < fn.supers.length; i++) {
			if(fn.supers[i] && fn.supers[i][func]) {
				return fn.supers[i][func].apply(this, Array.prototype.slice.call(arguments, 1));
				break;
			}
		}
		
		return this;
	}
	
	return fn;
}

exports.Class = (function() {
	function Class(constructor, proto) {
		if(typeof constructor != "function") {
			proto = constructor;
			constructor = function Class(props) {
				if(props) {
					globalExtend(this, props);
				}
			};
		}
		
		return makeFromFunc(constructor, proto);
	}
	
	return Class;
})();
