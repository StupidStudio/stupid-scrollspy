(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Call controller
 */
var callctrl = {
	/**
	 * Once (call a function once)
	 * @example once.trigger(); once.reset();
	 * @param {function} callback The callback
	 * @config {boolean} bool Boolean to control actions
	 * @return {object} Returns a object to trigger callback
	 */
	once: function once(callback){
		var bool = false;
		return{
			trigger:function(){
				if(bool) return;
				bool = true;
				callback();
			},
			reset:function(){
				bool = false;
			}	
		}
	},

	/**
	 * Shift (callbackA can only be called once, until callbackB has been called)
	 * @example shift.alpha(); shift.beta();
	 * @param {function} callbackA The callback
	 * @param {function} callbackB The callback
	 * @config {boolean} bool Boolean to control actions
	 * @return {object} Returns a object to trigger callbacks
	 */
	shift: function shift(callbackA, callbackB){
		var bool = false;
		var callbackA = callbackA || function(){};
		var callbackB = callbackB || function(){};
		return {
			alpha:function() {
				if(bool) return;
				bool = true;
				callbackA();
			},
			beta:function() {
				if(!bool) return;
				bool = false;
				callbackB();
			}
		}
	},

	/**
	 * Toggle (toggle between callbackA and callbackB)
	 * @example toggle.trigger(); toggle.reset();
	 * @param {function} callbackA The callback
	 * @param {function} callbackB The callback
	 * @config {boolean} bool Boolean to control actions
	 * @return {object} Returns a object to trigger callbacks
	 */
	toggle: function toggle(callbackA, callbackB){
		var bool = true;
		return {
			trigger: function() {
				if(bool){
		 			callbackA();
		 		}else{
		 			callbackB();
		 		}
	 			bool = !bool;
			},
			reset:function(){
				bool = true;	
			}
		}
	}
}

/** @export */
module.exports = callctrl;

},{}],2:[function(require,module,exports){
/**
 * Changed
 * @constructor
 */
function Changed(opts){
 	/**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} Options for the constructor 
     */
    var opts = opts || {};

     /**
     * @define {array} Holds the values
     */
	var values;

	/**
	 * Trigger and update if values are changed
	 */
	function trigger(){
		/** Convert to array */
		var args = Array.prototype.slice.call(arguments);

		/** Splice to get the callback */
		var callback = args.splice(-1)[0];

		/** Loop through args */
		for (var i = 0; i < args.length; i++) {

			/** Check if values are changed */
			if(!values || values[i] != args[i]){

				/** If Changed call the callback */
				callback.apply(window, args);
				break;
			}
		}

		/** Set the values to the args */
		values = args;
	}

	/*
	* Public
	*/
	self.trigger = trigger;

	return self;
}

module.exports = Changed;
},{}],3:[function(require,module,exports){
/**
 * @fileoverview Simple event system.
 * @author david@stupid-studio.com (David Adalberth Andersen)
 */

/**
 * Event
 * @constructor
 */
function Event(opts){
	/**
	 * @define {object} Collection of public methods.
	 */
	var self = {};

	/**
	 * @define {object} options for the constructor 
	 */
	var opts = opts || {};

	/**
	 * @define {object} collection the event names as
	 * an identifyer for later calls
	 */
	var event = {};

	/**
	 * @define {object} collection of precalled events
	 */
	var queue = {};

	/**
	 * On method for collection the event calls
	 * @example event.on('custom-event', function(){ //do something });
	 * @param {string} key A string identifyer
	 * @param {function} call A callback for the identifyer
	 * @config {object} event[key] Set object[key] to array if not set
	 */
	function on(key, call){
		if(!event[key]) event[key] = [];

		/** add event */
		addEvent(key, call);
		
		/** if the event has been triggered before created, then trigger it now */
		if(queue[key]) call.apply(null, queue[key]);
	}

	/**
	 * Add event to events and override if it is the same
	 * @param {string} key A string identifyer
	 * @param {function} call A callback for the identifyer
	 */
	function addEvent(key, call){
		/**
		 * @define {boolean} if the function is the same,
		 * boolean will be set to true
		 */
		var same = false;
		/**
		 * Loop through the events on key
		 * This is for comparing two anonymous
		 */
		for (var i = 0; i < event[key].length; i++) {
			/** If anonymous function is the same set boolean to true */
			if(call.toString() === event[key][i].toString()){
				same = true;
				/** override the current callback */
				event[key][i] = call;
				break;
			}
		};
		/** If the functions isnt the same, push to call stack */
		if(opts.forcePush || !same) event[key].push(call);
	}

	/**
	 * Trigger the event
	 * @example event.trigger(key, params)
	 * @param {string} key The key for event objet
	 */
	function trigger(key){
		var events = event[key];
		/**
		 * @define {array} takes the arguments and removes the first param
		 */
		var args = Array.prototype.slice.call(arguments).slice(1);

		/** If first argument is an array, pass it as argument */
		if(arguments.length === 2 && arguments[1].constructor == Array) args = arguments[1];
		
		if(events){
			/** Trigger the events by the current key */
			for (var i = 0; i < events.length; i++) {
				events[i].apply(null, args);
			};
		}else{
			/**
			 * If the trigger method is call before any key is added
			 * save the key and params for to be called later
			 */
			queue[key] = args;
		}
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.on = on;
	self.trigger = trigger;

	/**
	 * @return {object} return public methods
	 */
	return self;
}

/** @export */
module.exports = Event;
},{}],4:[function(require,module,exports){
/**
 * Iterator iterates over a collection
 * @example var current = iterator.next(current, collection);
 */
var iterator = {
	/**
	 * Get the next item in a collection
	 * @example var current = iterator.next(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object} the new current
	 */
 	next: function(current, collection){
		return collection[ collection.indexOf(current) + 1 ] || collection[ 0 ];
	},

	/**
	 * Get the previous item in a collection
	 * @example var current = iterator.prev(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object} the new current
	 */
	prev: function(current, collection){
		return collection[ collection.indexOf(current) - 1 ] || collection[ collection.length - 1 ];
	},

	/**
	 * Get the next item in a collection or return false
	 * @example var current = iterator.nextOrFalse(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object | boolean} the new current or false
	 */
	nextOrFalse: function(current, collection){
		return collection[ collection.indexOf(current) + 1 ] || false;
	},

	/**
	 * Get the previous item in a collection or return false
	 * @example var current = iterator.prevOrFalse(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object | boolean} the new current or false
	 */
	prevOrFalse: function(current, collection){
		return collection[ collection.indexOf(current) - 1 ] || false;
	},

	/**
	 * Check if item is the first in the collection
	 * @example var current = iterator.isFirst(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {boolean}
	 */
	isFirst:function(current, collection){
		return Boolean(current === collection[ 0 ]);
	},

	/**
	 * Check if item is the last in the collection
	 * @example var current = iterator.isLast(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {boolean}
	 */
	isLast: function(current, collection){
		return Boolean(current === collection[ collection.length - 1 ]);
	},

	/**
	 * Add newObject to collection if its not already in it.
	 * @example iterator.add(newObject, collection);
	 * @param {object} newObject 
	 * @param {array} collection The collection
	 * @return {number} Return the location object have in array
	 */
	add: function(newObject, collection){
		var index = collection.indexOf(newObject);
		if (index === -1) collection.push(newObject);
	},

	/**
	 * Removes object from collection if its in it.
	 * @example iterator.remove(object, collection);
	 * @param {object} object 
	 * @param {array} collection The collection
	 * @return {number} Return the location object had in array
	 */
	remove: function(object, collection){
        var index = collection.indexOf(object);
        if (index != -1) collection.splice(index, 1);
	},

	/**
	 * Return an object with prefixed current and collection
	 * @example iterator.create(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object} return new object that uses iterator
	 */
	create: function(current, collection){
		return {

			/**
			 * Get next in collection
			 * @return {object} The current object
			 */
			next: function(){
				current = iterator.next(current, collection);
				return current;
			},

			/**
			 * Get previous in collection
			 * @return {object} The current object
			 */
			prev: function(){
				current = iterator.prev(current, collection);
				return current;
			},

			/**
			 * Get previous or false (set current if not false)
			 * @return {object | boolean} The current object or false
			 */
			nextOrFalse: function(){
				var objectOrFalse = iterator.nextOrFalse(current, collection);
				current = objectOrFalse || current;
				return objectOrFalse;
			},

			/**
			 * Get next or false (set current if not false)
			 * @return {object | boolean} The current object or false
			 */
			prevOrFalse: function(){
				var objectOrFalse = iterator.prevOrFalse(current, collection);
				current = objectOrFalse || current;
				return objectOrFalse;
			},

			/**
			 * Is current first item in array
			 * @return {boolean} True / false
			 */
			isFirst: function(){
				return iterator.isFirst(current, collection);
			},

			/**
			 * Is current last item in array
			 * @return {boolean} True / false
			 */
			isLast: function(){
				return iterator.isLast(current, collection);
			},

			/**
			 * Add object to collection
			 * @return {object} The current object
			 */
			add: function(object){
				iterator.add(object, collection);
				return current;
			},

			/**
			 * Remove object from collection
			 * Set current to new object if current if removed
			 * @return {object} The current object
			 */
			remove: function(object){

				/**
				 * If object is current do something
				 */
				if(object === current){

					/**
					 * If current is first, set current to the next item
					 * Else set current to previous item
					 */
					if(iterator.isFirst(current, collection)){
						current = iterator.next(current, collection);	
					}else{
						current = iterator.prev(current, collection);
					}
				}

				/** Return object from collection */
				iterator.remove(object, collection);

				return current;
			},

			/**
			 * Set object to current
			 * @return {object} The current object
			 */
			set: function(object){
				current = object;
				return current;
			},

			/**
			 * Get the current object
			 * @return {object} The current object
			 */
			get: function(){
				return current;
			}
		};
	}
}

/** @export */
module.exports = iterator;
},{}],5:[function(require,module,exports){
var Event = require('stupid-event');
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
	 * @define {Event} Event
	 */
	var event = Event();

	/**
	 * @define {Changed} Changed
	 */
	var changed = Changed();

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

		/**
		 *  Emit window scrollprogress
		 */
		var windowProgress = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
		changed.trigger(windowProgress, function (value) {
			event.trigger('progress', {
				progress: value
			})
		})
	}

	/**
	 * Add
	 * @example scrollspy.add(HTMLElement);
	 * @param {HTMLElement} _HTMLElement
	 * @param {boolean} _useCSS Use css to express visibility
	 * @config {boolean} useCSS Sets useCSS. Uses global option
	 * @return {ScrollspyElement} Returns a ScrollspyElement to listen on
	 */
	function add(_HTMLElement, _opts){
		var options = _opts || {};
		var useCSS = options.useCSS != undefined ? options.useCSS : opts.useCSS;
		var compensateTop = options.compensateTop != undefined ? options.compensateTop : opts.compensateTop;
		var compensateBottom = options.compensateBottom != undefined ? options.compensateBottom : opts.compensateBottom;

		var scrollspyElement = ScrollspyElement({
			el:_HTMLElement, 
			useCSS: useCSS,
			compensateTop: compensateTop,
			compensateBottom: compensateBottom
		});

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
	 * Clean all elements from collection
	 */
	function flush () {
		for (var i = 0; i < collection.length; i++) {
			collection[i].destroy();
		}
		collection = [];
	}

	/**
	 * Destroy element
	 */
	function destroy () {
		tick.remove(update);
		flush();
		self = null;
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
	self.flush = flush;
	self.destroy = destroy;
	self.on = event.on;

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
	 * @define {boolean} Compensate for top and bottom element
	 */	
	var compensateTop = opts.compensateTop === true ? true : false;
	var compensateBottom = opts.compensateBottom === true ? true : false;

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
			if(compensateTop && t < 0){
				x = (window.innerHeight - rect.top) + t;
				y = (window.innerHeight + el.offsetHeight) + t;
				
			/**
			 * If the element is in the bottom window
			 * compensate for that
			 */
			}else if(compensateBottom && b > 0){
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
		if(!_el) return value;
		var value = _el.offsetTop + (_value || 0);
		if(_el === document.body) return value;
		return getAbsoluteOffsetTop(_el.offsetParent, value);
	}

	/**
	 * Trigger the progress event
	 */
	function progress(_value){
		event.trigger('progress', {
			el: el,
			direction: direction,
			progress: _value
		});	
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
		event.trigger('atTop', {
			el: el, 
			direction: direction
		});
	}

	function notAtTop(){
		if(useCSS) el.classList.remove('is-atTop');	
		event.trigger('notAtTop', {
			el: el, 
			direction: direction
		});
	}

	function atBottom(){
		if(useCSS) el.classList.add('is-atBottom');	
		event.trigger('atBottom', {
			el: el, 
			direction: direction
		});
	}

	function notAtBottom(){
		if(useCSS) el.classList.remove('is-atBottom');	
		event.trigger('notAtBottom', {
			el: el, 
			direction: direction
		});
	}

	function active(){
		if(useCSS){
			el.classList.add('is-active');
			removeCSSDirection();
			addCSSDirection();
		} 

		event.trigger('active', {
			el: el, 
			direction: direction
		});
	}

	function deactive(){
		if(useCSS) {
			el.classList.remove('is-active');	
			removeCSSDirection();
		}
		event.trigger('deactive', {
			el: el, 
			direction: direction
		});
	}

	function visible(){
		if(useCSS){
			el.classList.add('is-visible');
			removeCSSDirection();
			addCSSDirection();
		}
		event.trigger('visible', {
			el: el, 
			direction: direction
		});
	}

	function hidden(){
		if(useCSS){
			el.classList.remove('is-visible');
			removeCSSDirection();
			addCSSPosition();
		}
		event.trigger('hidden', {
			el: el, 
			direction: direction
		});
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

module.exports = Scrollspy;
},{"stupid-callctrl":1,"stupid-changed":2,"stupid-event":3,"stupid-iterator":4}]},{},[5]);
