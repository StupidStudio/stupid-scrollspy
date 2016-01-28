var tick = require('../tick').getInstance();
var scrollspy = require('../../scrollspy').getInstance({tick: tick, useCSS: true});

document.addEventListener("DOMContentLoaded", function(event) {
	var test = document.querySelectorAll('.test');
	for (var i = 0; i < test.length; i++) {
		createScroll(test[i]);
	};

	function createScroll(_item){
		var listener = scrollspy.add(_item);
	}

});