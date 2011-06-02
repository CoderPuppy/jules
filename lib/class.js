function copy(obj) {
	var copyed;
	
	if(Object.prototype.toString.call(obj) == '[object Array]') {
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

exports.Class = (function() {
	function Class(proto) {
		return (function() {
			function C(props) {
				if(props) {
					globalExtend(this, props);
				}
			}
			
			C.prototype = proto;
			
			C.supers = [];
			
			C.subClass = function subClass(proto) {				
				return (new exports.Class(proto)).extend(this);
			}
			
			C.extend = function extend(classObj) {
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
			
			C.Static = function Static(prop, val) {
				if(typeof prop == "object") {
					for(key in prop) {
						this.Static(key, prop[key]);
					}
				} else {
					this[prop] = val;
				}
				
				return this;
			}
			
			return C;
		})();
	}
	
	return Class;
})();
