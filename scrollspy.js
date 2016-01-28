var Event = require('stupid-event');
var Singleton = require('stupid-singleton');
var Callctrl = require('stupid-callctrl');
var Iterator = require('stupid-iterator');

function Scrollspy(opts){
 	var self = {};
	var opts = opts || {};
	var tick = opts.tick;
	var collection = [];
	var current;
	var prev;

	/*
	* Private
	*/

	function init(){
		tick.add(update);
	}

	function update(){
		loopCollection();
	}

	function loopCollection(){
		if(!collection.length) return;
		if(!current) current = collection[0];

		for (var i = 0; i < collection.length; i++) {
			collection[i].update();
		};

		var name = document.querySelectorAll('selector');
		// Is top
		if(window.pageYOffset <= 0){

			var temp = collection[0];
			if(temp.getVisibility() > 0) current = temp;

		// Is bottom
		}else if(window.pageYOffset >= (document.documentElement.scrollHeight - window.innerHeight)){

			var temp = collection[collection.length - 1];
			if(temp.getVisibility() > 0) current = temp;

		// Is "mid"
		}else{

			for (var u = 0; u < collection.length; u++) {
				if(collection[u].getVisibility() > current.getVisibility()){
					current = collection[u];
				}
			};

		}

		if(current != prev){
			if(prev) prev.deactive();
			current.active();
			prev = current;
		}
	}

	function add(_el, _useCSS){
		var useCSS = _useCSS != undefined ? _useCSS : opts.useCSS;
		var scrollspyElement = ScrollspyElement({el:_el, useCSS: useCSS});
		Iterator.add(scrollspyElement, collection);
		return scrollspyElement; 
	}

	function remove(_el){
		Iterator.remove(_el, collection);
	}

	/*
	* Public
	*/
	self.add = add;
	self.remove = remove;
	/*
	* Init
	*/

	init();

	return self;
}

function ScrollspyElement(opts){
	var self = {};
	var opts = opts || {};
	var el = opts.el;
	var useCSS = opts.useCSS === true ? true : false;
	var visibility = 0;
	var direction = 0;
	var event = Event();
	var shift = Callctrl.shift(visible, hidden);
	var atTopCtrl = Callctrl.shift(atTop, notAtTop);

	/*
	* Private
	*/

	function init(){
		calcVisibility();
		addCSSPosition();
		event.trigger('initialize', el, direction);
	}

	function update(){
		calcVisibility();
	}

	function calcVisibility(){
		var rect = el.getBoundingClientRect();
		var top = window.innerHeight - rect.top;
		var bottom = rect.bottom;

		var pct = ((top < bottom) ? top : bottom) / window.innerHeight;
		pct = parseInt(pct * 100);
		pct = pct > 100 ? 100 : pct < 0 ? 0 : pct;

		visibility = pct;
		direction = (bottom - top) === 0 ? "center" : (bottom - top) < 0 ? "top" : "bottom";

		if(rect.top < 0 && rect.bottom > 0){
			atTopCtrl.alpha();
		}else{
			atTopCtrl.beta();
		}

		if(visibility === 0){
			shift.beta();
		}else{
			shift.alpha();
		}
	}

	function getVisibility(){
		return visibility;
	}

	function atTop(){
		if(useCSS) el.classList.add('is-atTop');	
		event.trigger('atTop', el, direction);
	}

	function notAtTop(){
		if(useCSS) el.classList.remove('is-atTop');	
		event.trigger('notAtTop', el, direction);
	}

	function active(){
		if(useCSS){
			el.classList.add('is-active');
			removeCSSDirection();
			addCSSDirection();
		} 

		event.trigger('active', el, direction);
	}

	function deactive(){
		if(useCSS) {
			el.classList.remove('is-active');	
			removeCSSDirection();
		}
		event.trigger('deactive', el, direction);
	}

	function visible(){
		if(useCSS){
			el.classList.add('is-visible');
			removeCSSDirection();
			addCSSDirection();
		}
		event.trigger('visible', el, direction);
	}

	function hidden(){
		if(useCSS){
			el.classList.remove('is-visible');
			removeCSSDirection();
			addCSSPosition();
		}
		event.trigger('hidden', el, direction);
	}

	function addCSSDirection(){
		el.classList.add('direction--' + direction);
	}

	function addCSSPosition(){
		if(el.classList.contains('position--top')) el.classList.remove('position--top');
		if(el.classList.contains('position--bottom')) el.classList.remove('position--bottom');
		el.classList.add('position--' + direction);
	}
	function removeCSSDirection(){
		if(el.classList.contains('direction--top')) el.classList.remove('direction--top');
		if(el.classList.contains('direction--bottom')) el.classList.remove('direction--bottom');
	}

	/*
	* Public
	*/
	self.update = update;
	self.active = active;
	self.deactive = deactive;
	self.getVisibility = getVisibility;
	self.on = event.on;

	/*
	* Init
	*/

	init();

	return self;
}

module.exports = Singleton(Scrollspy);