map(function(map) {
	map.route("/hi", "index", "hi");
	
	map.connect("/:controller(/:action)(.:format)", {
		"requirements": {
			"controller": "\\w*",
			"action": "[\\w\\d]*"
		}
	});
});
