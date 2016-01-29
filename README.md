# Stupid Scrollspy
Another stupid scrollspy


## Usage
Scrollspy is dependen on `stupid-tick`. Add the `tick` to the scrollspy object. Scrollspy is a singleton object, so to get the object use `getInstance()`.
 
```javascript
var tick = require('stupid-tick');
var scrollspy = require('stupid-scrollspy').getInstance({tick: tick});

// Query elements
var HTMLElements = document.querySelectorAll('.htmlelement');

// Loop over elements
for (var i = 0; i < HTMLElements; i++) {
	// Create scrollspy elements
	createScrollspyElements(HTMLElements[i]);
};

function createScrollspyElements(_htmlElement){
	// Add html element to scrollspy
	var scrollspyElement = scrollspy.add(_htmlElement);
	
	// Listen on the scrollspy element
	scrollspyElement.on('active', function(_el, _direction){
		console.log('active', _el, _direction);
	});
}

```
## Events

```javascript
var scrollspy = require('stupid-scrollspy').getInstance({tick: tick});

// Add to scrollspy
var scrollspyElement = scrollspy.add(_htmlElement);

// Remove from scrollspy
scrollspy.add(scrollspyElement);
```

## Scrollspy Element Events

```javascript
// Active
scrollspyElement.on('active', function(_el, _direction){
	console.log('active', _el, _direction);
});
scrollspyElement.on('deactive', function(_el, _direction){
	console.log('deactive', _el, _direction);
});

// Visibility
scrollspyElement.on('visible', function(_el, _direction){
	console.log('visible', _el, _direction);
});
scrollspyElement.on('hidden', function(_el, _direction){
	console.log('hidden', _el, _direction);
});

// Top of screen
scrollspyElement.on('atTop', function(_el, _direction){
	console.log('atTop', _el, _direction);
});
scrollspyElement.on('notAtTop', function(_el, _direction){
	console.log('notAtTop', _el, _direction);
});

// Bottom of screen
scrollspyElement.on('atBottom', function(_el, _direction){
	console.log('atBottom', _el, _direction);
});
scrollspyElement.on('notAtBottom', function(_el, _direction){
	console.log('notAtBottom', _el, _direction);
});
```