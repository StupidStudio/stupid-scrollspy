var Event = require('stupid-event');
var Singleton = require('stupid-singleton');
var Callctrl = require('stupid-callctrl');
var Iterator = require('stupid-iterator');

/**
 * Scrollspy
 * @constructor
 */
function Scrollspy(opts){
 	/**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} Options for the constructor 
     */
    var opts = opts || {};

    /**
	 * @define {Tick} Tick object
	 */
	var tick = opts.tick;

	/**
	 * @define {array} Collection
	 */
	var collection = [];

	/**
	 * @define {ScrollspyElement} Current ScrollspyElement
	 */
	var current;

	/**
	 * @define {ScrollspyElement} Previous ScrollspyElement
	 */
	var prev;

	
	/**
	 * Init
	 * Add update to ticker
	 */
	function init(){
		tick.add(update);
	}

	/**
	 * Update and loop collection
	 */
	function update(){
		loopCollection();
	}

	/**
	 * Loop collection
	 */
	function loopCollection(){
		/**
		 * If collection is empty dont loop
		 */
		if(!collection.length) return;

		/**
		 * Set current if not set
		 */
		if(!current) current = collection[0];

		/**
		 * Loop over collection to
		 * find the items position in the window
		 */
		for (var i = 0; i < collection.length; i++) {
			collection[i].update();
		};

		/**
		 * If page is at top
		 */
		if(window.pageYOffset <= 0){

			/**
			 * Set the first item to active
			 * if the item is visible set to current
			 */
			var temp = collection[0];
			if(temp.getVisibility() > 0) current = temp;

		/**
		 * If page is at bottom
		 */
		}else if(window.pageYOffset >= (document.documentElement.scrollHeight - window.innerHeight)){

			/**
			 * Set the last item to current
			 * if the item is visible
			 */
			var temp = collection[collection.length - 1];
			if(temp.getVisibility() > 0) current = temp;

		/**
		 * If not at top or bottom
		 */
		}else{

			/**
			 * Loop over the collectio to find
			 * which item is most visible
			 * set that item to current
			 */
			for (var u = 0; u < collection.length; u++) {
				if(collection[u].getVisibility() > current.getVisibility()){
					current = collection[u];
				}
			};
		}

		/**
		 * If there is an new current item
		 * then disable the previous current item
		 * and set the new current item active
		 */
		if(current != prev){
			if(prev) prev.deactive();
			current.active();
			prev = current;
		}
	}

	/**
	 * Add
	 * @example scrollspy.add(HTMLElement);
	 * @param {HTMLElement} _HTMLElement
	 * @param {boolean} _useCSS Use css to express visibility
	 * @config {boolean} useCSS Sets useCSS. Uses global option
	 * @return {ScrollspyElement} Returns a ScrollspyElement to listen on
	 */
	function add(_HTMLElement, _useCSS){
		var useCSS = _useCSS != undefined ? _useCSS : opts.useCSS;
		var scrollspyElement = ScrollspyElement({el:_HTMLElement, useCSS: useCSS});
		/** Adds the element to the collection */
		Iterator.add(scrollspyElement, collection);
		return scrollspyElement; 
	}

	/**
	 * Removes element from collection
	 */
	function remove(_scrollspyElement){
		Iterator.remove(_scrollspyElement, collection);
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.add = add;
	self.remove = remove;

	/**
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
	var atBottomCtrl = Callctrl.shift(atBottom, notAtBottom);

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

		if(rect.top < window.innerHeight && rect.bottom > window.innerHeight){
			atBottomCtrl.alpha();
		}else{
			atBottomCtrl.beta();
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

	function atBottom(){
		if(useCSS) el.classList.add('is-atBottom');	
		event.trigger('atBottom', el, direction);
	}

	function notAtBottom(){
		if(useCSS) el.classList.remove('is-atBottom');	
		event.trigger('notAtBottom', el, direction);
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
		el.classList.add('has-directionFrom' + titleCase(direction));
	}

	function addCSSPosition(){
		if(el.classList.contains('has-positionTop')) el.classList.remove('has-positionTop');
		if(el.classList.contains('has-positionBottom')) el.classList.remove('has-positionBottom');
		el.classList.add('has-position' + titleCase(direction));
	}
	function removeCSSDirection(){
		if(el.classList.contains('has-directionFromTop')) el.classList.remove('has-directionFromTop');
		if(el.classList.contains('has-directionFromBottom')) el.classList.remove('has-directionFromBottom');
	}

	function titleCase(_str){
    	return _str.replace(/\w+/g, function(_str){return _str.charAt(0).toUpperCase() + _str.substr(1).toLowerCase();});
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