var tick = require('../tick').getInstance();
var scrollspy = require('../../scrollspy').getInstance({tick: tick, useCSS: true});

document.addEventListener("DOMContentLoaded", function(event) {
	var test = document.querySelectorAll('.test');
	for (var i = 0; i < test.length; i++) {
		createScrollspyElements(test[i]);
	};

	function createScrollspyElements(_htmlElement){
		var scrollspyElement = scrollspy.add(_htmlElement);
		var progressHTML = _htmlElement.querySelector('.progress');

		scrollspyElement.on('visibleProgress', function(_el, _direction, _visible){
			// console.log('visibleProgress', _visible);
			progressHTML.style.width = _visible * 100 + '%';
			progressHTML.style.top = _visible * 100 + '%';
		});

		// scrollspyElement.on('active', function(_el, _direction){
		// 	console.log('active', _el, _direction);
		// });
		// scrollspyElement.on('deactive', function(_el, _direction){
		// 	console.log('deactive', _el, _direction);
		// });

		// scrollspyElement.on('visible', function(_el, _direction){
		// 	console.log('visible', _el, _direction);
		// });
		// scrollspyElement.on('hidden', function(_el, _direction){
		// 	console.log('hidden', _el, _direction);
		// });

		// scrollspyElement.on('atTop', function(_el, _direction){
		// 	console.log('atTop', _el, _direction);
		// });
		// scrollspyElement.on('notAtTop', function(_el, _direction){
		// 	console.log('notAtTop', _el, _direction);
		// });

		// scrollspyElement.on('atBottom', function(_el, _direction){
		// 	console.log('atBottom', _el, _direction);
		// });
		// scrollspyElement.on('notAtBottom', function(_el, _direction){
		// 	console.log('notAtBottom', _el, _direction);
		// });
	}

});