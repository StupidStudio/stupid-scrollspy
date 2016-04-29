var Event = require('stupid-event');
var Singleton = require('stupid-singleton');
var Callctrl = require('stupid-callctrl');
var Iterator = require('stupid-iterator');
var Changed = require('stupid-changed');

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
		_scrollspyElement.destroy();
	}

	/**
	 * Map
	 */

	function map (_value, _istart, _istop, _ostart, _ostop) {
		var ostart = _ostart === undefined ? 0 : _ostart;
		var ostop = _ostop === undefined ? 1 : _ostop;
		if(_value < _istart) return ostart;
		if(_value > _istop) return ostop;
		return ostart + (ostop - ostart) * ((_value - _istart) / (_istop - _istart));
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.add = add;
	self.remove = remove;
	self.map = map;

	/**
	 * Init
	 */

	init();

	return self;
}

function ScrollspyElement(opts){
	/**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} Options for the constructor 
     */
    var opts = opts || {};

    /**
     * @define {HTMLElement} The HTMLElement
     */
	var el = opts.el;

	/**
	 * @define {boolean} UseCSS boolean
	 */
	var useCSS = opts.useCSS === true ? true : false;

	/**
	 * @define {Number} Visibility indicator
	 */
	var visibility = 0;

	/**
	 * @define {int} Direction indicator
	 */
	var direction = 0;

	/**
	 * @define {Event} Event
	 */
	var event = Event();

	/**
	 * @define {Changed} Changed
	 */
	var changed = Changed();


	/**
	 * @define {number} OffsetTop Position
	 */
	var offsetTop = getAbsoluteOffsetTop(el);

	/**
	 * @define {Object} Shift objects
	 */
	var visibilityCtrl = Callctrl.shift(visible, hidden);
	var atTopCtrl = Callctrl.shift(atTop, notAtTop);
	var atBottomCtrl = Callctrl.shift(atBottom, notAtBottom);

	/**
	 * Init
	 */

	function init(){
		/**
		 * Calc visibility for the element
		 */
		calcVisibility();

		/**
		 * Add css class positions
		 */
		addCSSPosition();

		/** Trigger initialize event */
		event.trigger('initialize', el, direction);
	}

	/**
	 * Update method for calculation visibility
	 */
	function update(){
		calcVisibility();
	}

	/**
	 * Calculate visibility
	 */
	function calcVisibility(){
		/** Get element position in the document */
		var rect = el.getBoundingClientRect();
		var top = window.innerHeight - rect.top;
		var bottom = rect.bottom;

		/**
		 * Calculate the visibilty of the element in percentages
		 * 100% is center in the window and filling the window
		 * 0% is off screen/window
		 */
		var pct = ((top < bottom) ? top : bottom) / window.innerHeight;
		pct = parseInt(pct * 100);
		pct = pct > 100 ? 100 : pct < 0 ? 0 : pct;

		/**
		 * Sets local variables
		 */
		visibility = pct;
		/** Sets direction */
		direction = (bottom - top) === 0 ? "center" : (bottom - top) < 0 ? "top" : "bottom";

		/**
		 * Calculates if element is at top of the window
		 */
		if(rect.top < 0 && rect.bottom > 0){
			atTopCtrl.alpha();
		}else{
			atTopCtrl.beta();
		}

		/**
		 * Calculates if the element is at bottom of the window
		 */
		if(rect.top < window.innerHeight && rect.bottom > window.innerHeight){
			atBottomCtrl.alpha();
		}else{
			atBottomCtrl.beta();
		}

		/**
		 * Toggles the visibilty
		 */
		if(visibility === 0){
			visibilityCtrl.beta();
		}else{
			visibilityCtrl.alpha();
		}

		/** Updates pct scroll */
		if(visibility != 0){

			/** Setup variables */
			var x, y, z;

			/** If the element is at top */
			var t = offsetTop - window.innerHeight;

			/** Check if element is at bottom */
			var b = (offsetTop + el.offsetHeight) - (document.documentElement.scrollHeight - window.innerHeight);

			/**
			 * If the element is in top window from the start
			 * compensate for that
			 */
			if(t < 0){
				x = (window.innerHeight - rect.top) + t;
				y = (window.innerHeight + el.offsetHeight) + t;
				
			/**
			 * If the element is in the bottom window
			 * compensate for that
			 */
			}else if(b > 0){
				x = (window.innerHeight - rect.top);
				y = el.offsetHeight + (document.documentElement.scrollHeight - (offsetTop + el.offsetHeight));

			/**
			 * Default progress calc
			 */
			}else{
				x = (window.innerHeight - rect.top);
				y = (window.innerHeight + el.offsetHeight);
			}

			/** Calc the progress */
			z = x / y;

			/** Trigger the event */
			changed.trigger(z, progress);
			
		}
	}

	/**
	 * Get Absolute OffsetTop of Element
	 */
	function getAbsoluteOffsetTop(_el, _value){
		var value = _el.offsetTop + (_value || 0);
		if(_el === document.body) return value;
		return getAbsoluteOffsetTop(_el.offsetParent, value);
	}

	/**
	 * Trigger the progress event
	 */
	function progress(_value){
		event.trigger('progress', el, direction, _value);	
	}

	/**
	 * Returns the visibility
	 * @return {Number}
	 */
	function getVisibility(){
		return visibility;
	}

	/**
	 * Adds classes to the element and trigger events
	 */
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
		if(useCSS){
			el.classList.add('has-directionFrom' + titleCase(direction));
		}
	}

	function addCSSPosition(){
		if(useCSS){
			if(el.classList.contains('has-positionTop')) el.classList.remove('has-positionTop');
			if(el.classList.contains('has-positionBottom')) el.classList.remove('has-positionBottom');
			el.classList.add('has-position' + titleCase(direction));
		}
	}
	function removeCSSDirection(){
		if(useCSS){
			if(el.classList.contains('has-directionFromTop')) el.classList.remove('has-directionFromTop');
			if(el.classList.contains('has-directionFromBottom')) el.classList.remove('has-directionFromBottom');
		}
	}

	/**
	 * Destroy item
	 */
	function destroy(){
		if(useCSS){
			if(el.classList.contains('has-positionTop')) el.classList.remove('has-positionTop');
			if(el.classList.contains('has-positionBottom')) el.classList.remove('has-positionBottom');
			if(el.classList.contains('has-directionFromTop')) el.classList.remove('has-directionFromTop');
			if(el.classList.contains('has-directionFromBottom')) el.classList.remove('has-directionFromBottom');
			if(el.classList.contains('is-atTop')) el.classList.remove('is-atTop');
			if(el.classList.contains('is-atBottom')) el.classList.remove('is-atBottom');
			if(el.classList.contains('is-active')) el.classList.remove('is-active');
			if(el.classList.contains('is-visible')) el.classList.remove('is-visible');
		}
		self = null;
	}

	/**
	 * Converts string to title case
	 */
	function titleCase(_str){
    	return _str.replace(/\w+/g, function(_str){return _str.charAt(0).toUpperCase() + _str.substr(1).toLowerCase();});
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.update = update;
	self.active = active;
	self.deactive = deactive;
	self.getVisibility = getVisibility;
	self.on = event.on;
	self.destroy = destroy;

	/**
	 * Init
	 */

	init();

	return self;
}

module.exports = Singleton(Scrollspy);