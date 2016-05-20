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
/**
 * @fileoverview JS Singleton constructor
 * @author david@stupid-studio.com (David Adalberth Andersen)
 */

 /**
 * Singleton
 * @constructor
 * @param {function} moduleConstructor Passes the moduleConstructor
 */
function Singleton(moduleConstructor){
    /**
     * Returns a self-execution function that returns an object
     * @example var Module = Singleton(ModuleConstructor); var mod = Module.getInstance();
     * @config {object} instance An object that holds the module
     * @return {objcet} An object that returns the module via .getInstance()
     */
    return (function () {
        var instance;
        
        /**
         * Create the new module
         */
        function createInstance(opts) {
            var object = moduleConstructor(opts);
            return object;
        }
        
        /**
         * Return an objcet with .getInstance() that returns the module
         * @param {oject} opts Passes the option for the module
         * @config {object} instance If the instance is empty create new module, else return instance
         * @return {object} returns the module (instance)
         */
        return {
            getInstance: function (opts) {
                if (!instance) instance = createInstance(opts);
                return instance;
            }
        };
    })();
}

/** @export */
module.exports = Singleton;
},{}],6:[function(require,module,exports){
/**
 * @fileoverview Tick RAF controller
 * @author david@stupid-studio.com (David Adalberth Andersen)
 */

var Callctrl = require('stupid-callctrl');
/**
 * Deferred
 * @constructor
 * @param {object} opts Options for the constructor
 */
function Tick(opts) {
    /**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} options for the constructor 
     */
    var opts = opts || {};

    /**
     * @define {array} Collection of function that should be called on every RAF
     */
    var collection = [];

    /**
     * @define {function} requestAnimationFrame variable
     */
    var raf;

    /**
     * @define {number} Holds the current time every tick
     */
    var now;

    /**
     * @define {number} Holds the last time of every tick
     */
    var then = Date.now();

    /**
     * @define {number} Holds the difference bwteen now and then
     */
    var delta;

    /**
     * @define {number} Frames pr second (defaults to 60fps)
     */
    var fps = opts.fps || 60;

    /**
     * @define {boolean} Should stop when collection is empty
     */
    var autoPlayStop = opts.autoPlayStop || false;

    /**
     * @define {number} Converting fps to miliseconds
     */
    var interval = 1000/fps;

    /**
     * @define {boolean} Control is the loop should run
     */
    var isStopped = false;

    /**
     * @define {object} Create a once callback
     */
    var startOnce = Callctrl.once(function(){
        start();
    });

    /**
     * Renders update function at fps giving above
     * @param {type} varname description
     * @config {number} now Set the current time
     * @config {number} delta Calculates the difference between now and then
     */
    function render() {
        if (isStopped) return;

        now = Date.now();
        delta = now - then;
        /**
         * If the difference between now and then is bigger than fps (miliseconds) draw collection.
         */
        if (delta >= interval) {
            /** calculates new then time */
            then = now - (delta % interval);
            /** run updates */
            update();
        }

        /** Runs requestAnimationFrame for continues loop */
        raf = requestAnimationFrame(render);
    }

    /** Update run all the callbacks stored in collection */
    function update(){
        for (var i = 0; i < collection.length; i++) {
            collection[i]();
        };
    }

    /** Stars the render loop */
    function start(){
        isStopped = false;
        render();
    }

    /** Stops the render loop */
    function stop(){
        isStopped = true;
        if(raf) cancelAnimationFrame(raf);
        startOnce.reset();
    }

    /** Checks if Tick should stop or start if collection is empty */
    function shouldPlayOrPause() {
        if(autoPlayStop){
            if(collection.length){
                start();
            }else{
                stop();
            }
        }else{
            startOnce.trigger();
        }
    }

    /** Adds new callback, but checks if its already added */
    function add(callback) {
        var index = collection.indexOf(callback);
        if (index === -1){
            collection.push(callback);
            shouldPlayOrPause();
        }
    }

    /** Removes callback if its in the collection array */
    function remove(callback) {
        var index = collection.indexOf(callback);
        if (index != -1){
            collection.splice(index, 1);
            shouldPlayOrPause();
        }
    }

    /**
     * Public methos
     * @public {function}
     */
    self.add = add;
    self.remove = remove;
    self.start = start;
    self.stop = stop;

    /**
     * @return {object} Returns public methods
     */
    return self;
}

/** @export */
module.exports = Tick;
},{"stupid-callctrl":1}],7:[function(require,module,exports){
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
},{"stupid-callctrl":1,"stupid-changed":2,"stupid-event":3,"stupid-iterator":4,"stupid-singleton":5}],8:[function(require,module,exports){
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

		scrollspyElement.on('progress', function(_el, _direction, _progress){
			// console.log('visibleProgress', _progress);
			var v = _progress;
			// v = scrollspy.map(_progress, 0.2, 0.8);
			progressHTML.style.width = v * 100 + '%';
			progressHTML.style.top = v * 100 + '%';
			console.log(_direction, v);
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
},{"../../scrollspy":7,"../tick":9}],9:[function(require,module,exports){
var Singleton = require('stupid-singleton');
var Tick = require('stupid-tick');
module.exports = Singleton(Tick); 
},{"stupid-singleton":5,"stupid-tick":6}]},{},[8]);
