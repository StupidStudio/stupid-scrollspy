# Stupid Scrollspy
Another stupid scrollspy


## Usage
Scrollspy is dependen on `stupid-tick`. Add the `tick` to the scrollspy object. Scrollspy is a singleton object, so to get the object use `getInstance()`.
 
```javascript
var Tick = require('stupid-tick');
var tick = Tick();

var Scrollspy = require('stupid-scrollspy');
var scrollspy = Scrollspy({tick: tick});

// Query elements
var HTMLElements = document.querySelectorAll('.htmlelement');

// Loop over elements
for (var i = 0; i < HTMLElements.length; i++) {
	// Create scrollspy elements
	createScrollspyElements(HTMLElements[i]);
};

function createScrollspyElements(_htmlElement){
	// Add html element to scrollspy
	var scrollspyElement = scrollspy.add(_htmlElement);
	
	// Listen on the scrollspy element
	scrollspyElement.on('active', function(e){
		console.log('active', e.el, e.direction);
	});
}

```

## ScrollSpy Methods

```
var Scrollspy = require('stupid-scrollspy');
var scrollspy = Scrollspy({tick: tick});

// remove all element from the scrollspy
scrollspy.flush();

// destroy scrollspy
scrollspy.destroy();

```

## Options Global vs Local
Global:

```javascript
var Tick = require('stupid-tick');
var tick = Tick();

var Scrollspy = require('stupid-scrollspy');
var scrollspy = Scrollspy({
	tick: tick, 
	useCSS: true,
	compensateTop: true,
	compensateBottom: true
});

// Use CSS local override.
// scrollspy.add(HTMLElement, options);
var scrollspyElement = scrollspy.add(_htmlElement);

```

Local:

```javascript
var Tick = require('stupid-tick');
var tick = Tick();

var Scrollspy = require('stupid-scrollspy');
var scrollspy = Scrollspy({tick: tick});

// Use CSS local override.
// scrollspy.add(HTMLElement, options);
var scrollspyElement = scrollspy.add(_htmlElement,{
	useCSS: true,
	compensateTop: true,
	compensateBottom: true
});

```

## Compensate

The compensate options make the first and last child have the progress from 0 to 100 even though its progress is otherwise. It maps it so you can control a animation from 0 to 100.

```
var Tick = require('stupid-tick');
var tick = Tick();

var Scrollspy = require('stupid-scrollspy');
var scrollspy = Scrollspy({
	tick: tick, 
	compensateTop: true,
	compensateBottom: true
});

```


## Methods

```javascript
// Add to scrollspy
var scrollspyElement = scrollspy.add(_htmlElement);

// Remove from scrollspy
scrollspy.remove(scrollspyElement);

```

### Map Method
The progress event starts when the element is visible and ends when it is not visible. That is show by the progress value that goes from 0 to 1. But if you want that value to start and/or end sooner, you can use the map method.

When the progress value is a 0.2 the map method maps it to 0. And when the progress value is at 0.8 it maps it to 1. You still get a value range from 0 to 1.

```javascript
// Map progress value
scrollspyElement.on('progress', function(e){
	var mapped = scrollspy.map(e.progress, 0.2, 0.8);
});

```

## Scrollspy Element Events

```javascript
// Progress
scrollspyElement.on('progress', function(e){
	console.log('progress', e.el, e.direction, e.progress);
});

// Active
scrollspyElement.on('active', function(e){
	console.log('active', e.el, e.direction);
});
scrollspyElement.on('deactive', function(e){
	console.log('deactive', e.el, e.direction);
});

// Visibility
scrollspyElement.on('visible', function(e){
	console.log('visible', e.el, e.direction);
});
scrollspyElement.on('hidden', function(e){
	console.log('hidden', e.el, e.direction);
});

// Top of screen
scrollspyElement.on('atTop', function(e){
	console.log('atTop', e.el, e.direction);
});
scrollspyElement.on('notAtTop', function(e){
	console.log('notAtTop', e.el, e.direction);
});

// Bottom of screen
scrollspyElement.on('atBottom', function(e){
	console.log('atBottom', e.el, e.direction);
});
scrollspyElement.on('notAtBottom', function(e){
	console.log('notAtBottom', e.el, e.direction);
});
```

## Tests
See `test/live/public`.