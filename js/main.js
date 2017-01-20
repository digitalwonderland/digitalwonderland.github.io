(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _helpers = require('./utils/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _events = require('./utils/events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $ = require('jquery');
var Exoskeleton = require('exoskeleton');

require('respimage');

exports.default = function () {
    'use strict';

    // ----------------------------------
    // GLOBAL NAMESPACE
    // ----------------------------------

    // Save a reference to the global object

    var root = window;
    root.Backbone = {};
    root.Backbone.$ = $;

    // @borrow objects
    var App = root.App = _helpers2.default.extend(window.App || {}, {
        Vent: _helpers2.default.extend({}, Exoskeleton.Events)
    });

    // Add globals
    App.Exoskeleton = Exoskeleton;
    App.$ = $;
    App.EVENTS = _events2.default;

    /**
     * Create custom view with own properties and
     * take this view in our modules
     * register only one reference to our global library Exoskeleton
     */
    App.ComponentView = function (options) {
        Exoskeleton.View.call(this, options);
    };
    App.ComponentModel = function (options) {
        Exoskeleton.Model.call(this, options);
    };
    App.ComponentCollection = function (options) {
        Exoskeleton.Collection.call(this, options);
    };

    _helpers2.default.extend(App.ComponentView.prototype, Exoskeleton.View.prototype, {});
    _helpers2.default.extend(App.ComponentModel.prototype, Exoskeleton.Model.prototype, {});
    _helpers2.default.extend(App.ComponentCollection.prototype, Exoskeleton.Collection.prototype, {});

    App.ComponentView.extend = Exoskeleton.View.extend;
    App.ComponentModel.extend = Exoskeleton.Model.extend;
    App.ComponentCollection.extend = Exoskeleton.Collection.extend;

    /**
     * Add our Mixin to our View object.
     */
    App.ComponentView.classMixin = _helpers2.default.classMixin;

    // Feature detection
    App.support = App.support || {};
    App.support.touch = _helpers2.default.isTouch();
    App.clickHandler = _helpers2.default.clickHandler();

    // Versioning
    App.version = "0.0.1";

    // Global module registry
    App.modules = {};

    // Add module to global registry
    App.registerModule = function (module, el) {
        if (!App.modules[module.name]) {
            App.modules[module.name] = module;
            App.modules[module.name].nodes = [el];
        } else {
            App.modules[module.name].nodes.push(el);
        }

        App.Vent.trigger(App.EVENTS.moduleRegistered, {
            module: module,
            el: el
        });
    };

    // Media Query
    var head = document.querySelectorAll('head');
    App.currentMedia = window.getComputedStyle(head[0], null).getPropertyValue('font-family');

    // Screen Size
    App.screenSize = {
        width: root.innerWidth,
        height: root.innerHeight
    };

    // ----------------------------------
    // CHECKING
    // ----------------------------------


    if (document.location.search.indexOf('devmode') > -1) {
        App.devmode = true;
    }

    if (document.location.search.indexOf('logger') > -1) {
        App.logger = true;
    }

    // hide all warnings and logs if not in devmode
    if (!App.devmode) {
        console.log = console.warn = function () {};
    }

    // add console output element (triggered by parameter 'devmode' and 'logger' in url)
    if (App.devmode && App.logger) {
        (function () {
            var logger = document.createElement('pre');

            logger.setAttribute('id', 'logger');
            document.body.appendChild(logger);

            console.write = function () {
                for (var i = 0; i < arguments.length; i++) {
                    if (_typeof(arguments[i]) == 'object') {
                        logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + '<br />';
                    } else {
                        logger.innerHTML += arguments[i] + '<br />';
                    }
                }

                logger.innerHTML += '<br />';
                logger.scrollTop = logger.scrollHeight;
            };

            console.error = function () {
                logger.innerHTML += '[Error]<br />';
                console.write.apply(this, arguments);
            };

            console.warn = function () {
                logger.innerHTML += '[Warn]<br />';
                console.write.apply(this, arguments);
            };

            console.log = function () {
                logger.innerHTML += '[Log]<br />';
                console.write.apply(this, arguments);
            };
        })();
    }

    // ----------------------------------
    // GLOBAL EVENTS
    // ----------------------------------

    /**
     * Triggers
     */

    // Trigger global resize event
    window.onresize = function (e) {
        var currentMedia = window.getComputedStyle(head[0], null).getPropertyValue('font-family');
        var width = window.innerWidth;

        if (currentMedia !== App.currentMedia) {
            var oldMedia = App.currentMedia;

            App.currentMedia = currentMedia;
            console.log('App.currentMedia: ', App.currentMedia);

            App.Vent.trigger(App.EVENTS.mediachange, {
                type: App.EVENTS.mediachange,
                currentMedia: currentMedia,
                oldMedia: oldMedia
            });
        }

        if (width != App.screenSize.width) {
            App.screenSize.width = width;
            App.Vent.trigger(App.EVENTS.resize, e);
        }
    };

    document.onscroll = function (e) {
        App.Vent.trigger(App.EVENTS.scroll, e);
    };

    return App;
}.call(undefined);

},{"./utils/events":3,"./utils/helpers":4,"exoskeleton":"exoskeleton","jquery":"jquery","respimage":"respimage"}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Main Requirements


var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _helpers = require('./utils/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ES6 Modules

// @INSERTPOINT :: @ref: js-import

// Vars
var $ = _app2.default.$;

'use strict';

// Main Functionality

var Core = function () {
	function Core() {
		_classCallCheck(this, Core);

		this.initialize();
	}

	/**
  * Initialize our core functionality
  * This function will only be executed once.
  */


	_createClass(Core, [{
		key: 'initialize',
		value: function initialize() {
			console.log('App initialized with version: ', _app2.default.version);

			/**
    * Detect Touch
    */
			if (!_app2.default.support.touch) {
				$('html').addClass('no-touch');
			} else {
				$('html').addClass('touch');
			}

			// Redirect
			_app2.default.Vent.on(_app2.default.EVENTS.DOMredirect, function (obj) {
				if (!obj && !obj.url) throw new Error('Object is not defined. Please provide an url in your object!');

				// Redirect to page
				window.location.href = String(obj.url);
			});

			// @INSERTPOINT :: @ref: js-init-once-v3
		}
	}, {
		key: 'preRender',
		value: function preRender() {
			_helpers2.default.saveDOM();
		}
	}, {
		key: 'render',
		value: function render(context) {
			// @INSERTPOINT :: @ref: js-init-v3

		}
	}]);

	return Core;
}();

document.addEventListener("DOMContentLoaded", function () {
	var core = new Core();

	/**
  * Render modules
  */
	core.preRender();
	core.render(document);

	/**
  * Initialize modules which are loaded after initial load
  * via custom event 'DOMchanged'
  */
	_app2.default.Vent.on(_app2.default.EVENTS.DOMchanged, function (context) {
		console.log('Dom has changed. Initialising new modules in: ', context);
		core.preRender();
		core.render(context);
	});
});

},{"./app":1,"./utils/helpers":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * Const for events (pub/sub)
 *
 * @author: Sebastian Fitzner
 */

/**
 * Events Global
 */

var EVENTS = {
	blur: 'blur',
	change: 'change',
	click: 'click',
	dblclick: 'dblclick',
	DOMchanged: 'DOMchanged',
	DOMredirect: 'dom:redirect',
	hashchange: 'hashchange',
	input: 'input',
	keydown: 'keydown',
	keypress: 'keypress',
	keyup: 'keyup',
	mediachange: 'mediachange',
	moduleRegistered: 'moduleRegistered',
	mousedown: 'mousedown',
	mouseenter: 'mouseenter',
	mouseleave: 'mouseleave',
	mouseout: 'mouseout',
	mouseover: 'mouseover',
	mouseup: 'mouseup',
	reset: 'reset',
	resize: 'resize',
	scroll: 'scroll',
	submit: 'submit',
	swipe: 'swipe'
};

// @INSERTPOINT :: @ref: js-events

exports.default = EVENTS;

},{}],4:[function(require,module,exports){
/**
 * Represents a Helper Object.
 * @module Helper
 *
 * @author Sebastian Fitzner
 * @author Andy Gutsche
 */

'use strict';

/**
 * Imports
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('./polyfills/custom-event');

// @alias module: Helpers

var Helpers = {};

// ----------------------------------
// MODULE HELPERS
// ----------------------------------

/**
 * Save/Update DOM references for JS Modules
 *
 *
 */
Helpers.saveDOM = function () {
    Helpers.dataJsModules = Helpers.querySelectorArray('[data-js-module]');
};

/**
 * Initialize a module and render it and/or provide a callback function
 *
 * @param {Object} obj - Definition of our module
 * @param {string} obj.el - Required: element
 * @param {Object} obj.Module - Required: class which will be used to render your module
 * @param {boolean} [obj.render=true] - Optional: render the class, if false the class will only be initialized
 * @param {function} [obj.cb] - Optional: provide a function which will be executed after initialisation
 * @param {Object} [obj.context] - Optional: context of module
 *
 */
Helpers.loadModule = function (obj) {
    if (!obj.domName) throw new Error('In order to work with loadModule you need to define the module name (defined in data-js-module attribute) as string! ');
    if (!obj.module) throw new Error('In order to work with loadModule you need to define a Module!');

    var context = obj.context || document.querySelector('html');
    var renderOnInit = obj.render !== false;

    Helpers.forEach(Helpers.dataJsModules, function (i, el) {
        var dataModules = el.getAttribute('data-js-module').split(' ');

        if (dataModules.indexOf(obj.domName) != -1 && Helpers.checkElementInContext(el, context)) {
            var attrs = el.getAttribute('data-js-options');
            var options = JSON.parse(attrs);
            var module = new obj.module({
                el: el,
                options: options
            });

            // Render after initial module loading
            if (renderOnInit) module.render();
            // Provide callback function in which you can use module and options
            if (obj.cb && typeof obj.cb === "function") obj.cb(module, options);
        }
    });
};

// ----------------------------------
// EXTENDING HELPERS
// ----------------------------------

/**
 * Simple extend method to extend the properties of an object.
 *
 * @param {Object} obj - object which will be extended
 *
 * @return {Object} obj - extended object
 */
Helpers.extend = function extend(obj) {
    [].slice.call(arguments, 1).forEach(function (item) {
        for (var key in item) {
            obj[key] = item[key];
        }
    });
    return obj;
};

/**
 * Simple extend method, which extends an object.
 *
 * @param {Object} obj - object which will be extended
 *
 * @return {Object} obj - extended object
 */
Helpers.defaults = function defaults(obj) {
    [].slice.call(arguments, 1).forEach(function (item) {
        for (var key in item) {
            if (obj[key] === undefined) obj[key] = item[key];
        }
    });
    return obj;
};

/**
 * Merge method functions.
 *
 * @param {Object} from - Mixin object which will be merged via Helpers.defaults with the methods of our class
 * @param {Array} methods - Array of method names which will be extended.
 */
Helpers.classMixin = function (from) {
    var methods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['initialize', 'render'];


    var to = this.prototype;

    /** Add those methods which exists on `from` but not on `to` to the latter */
    Helpers.defaults(to, from);

    /** we do the same for events */
    if (to.events) {
        Helpers.defaults(to.events, from.events);
    }

    // Extend to's methods
    methods.forEach(function (method) {
        Helpers.extendMethod(to, from, method);
    });
};

/**
 * Helper method to extend an already existing method.
 *
 * @param {Object} to - view which will be extended
 * @param {Object} from - methods which comes from mixin
 * @param {string} methodName - function name
 */
Helpers.extendMethod = function (to, from, methodName) {
    function isUndefined(value) {
        return typeof value == 'undefined';
    }

    // if the method is defined on from ...
    if (!isUndefined(from[methodName])) {
        (function () {
            var old = to[methodName];

            // ... we create a new function on to
            to[methodName] = function () {

                // wherein we first call the method which exists on `to`
                var oldReturn = old.apply(this, arguments);

                // and then call the method on `from`
                from[methodName].apply(this, arguments);

                // and then return the expected result,
                // i.e. what the method on `to` returns
                return oldReturn;
            };
        })();
    }
};

// ----------------------------------
// FUNCTIONAL HELPERS
// ----------------------------------

/**
 * Get dom elements in an array
 *
 * @param {String} elem - Required: selector
 * @param {Object} [context] - Optional: context
 *
 * @return {Array}
 */
Helpers.querySelectorArray = Helpers.$ = function (elem, context) {
    if (!elem) throw new Error('In order to work with querySelectorArray you need to define an element as string!');
    var el = elem;
    var customContext = context || document;

    return Array.prototype.slice.call(customContext.querySelectorAll(el));
};

/**
 * Simple forEach method
 *
 * @param {Array} array - array of objects
 * @param {function} callback - callback function
 * @param {string} scope - scope of function
 */
Helpers.forEach = function (array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
        callback.call(scope, i, array[i]);
    }
};

/**
 * Find index of a specific item in an array.
 *
 * @param {Array} array - array in which we search for
 * @param {Object} item - item which will be searched
 */
Helpers.indexOf = function (array, item) {
    if (array == null) return -1;
    var l = void 0;
    var i = void 0;

    for (i = 0, l = array.length; i < l; i++) {
        if (array[i] === item) return i;
    }return -1;
};

/**
 * Return new RegExp
 *
 * @param {string} regEx - Regular Expression
 *
 * @return {RegExp}
 */
Helpers.regExp = function (regEx) {
    return new RegExp("(^|\\s+)" + regEx + "(\\s+|$)");
};

/**
 * Throttle method for resize events and more
 *
 * @param {function} func - Function which will be executed.
 * @param {number} wait - number to wait in milliseconds.
 * @param {boolean} immediate - execute function immediately.
 */

Helpers.throttle = function (func, wait, immediate) {
    var timeout = void 0;

    return function () {
        var context = this;
        var args = arguments;
        var callNow = immediate && !timeout;
        var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};

// ----------------------------------
// DETECTION HELPERS
// ----------------------------------

/**
 * Touch Detection
 */
Helpers.isTouch = function () {
    return 'ontouchstart' in window;
};

/**
 * Detect transitionend event.
 */
Helpers.transitionEndEvent = function () {
    var t = void 0;
    var el = document.createElement('fakeelement');
    var transitions = {
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    };

    for (t in transitions) {
        if (el.style[t] !== undefined) {
            return transitions[t];
        }
    }
};

/**
 * Detect animationend event.
 */
Helpers.animationEndEvent = function () {
    var t = void 0;
    var el = document.createElement('fakeelement');
    var animations = {
        'animation': 'animationend',
        'OAnimation': 'oAnimationEnd',
        'MozAnimation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd'
    };

    for (t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
};

/**
 * Request animation frame
 *
 * @return {function}
 */
Helpers.requestAniFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
};

// ----------------------------------
// CHECK HELPERS
// ----------------------------------

/**
 * based on https://github.com/inuyaksa/jquery.nicescroll/blob/master/jquery.nicescroll.js
 *
 * Todo: merge with checkElementInContext
 * @return {boolean}
 */
Helpers.hasParent = function (e, p) {
    if (!e) return false;
    var el = e.target || e.srcElement || e || false;
    while (el && el != p) {
        el = el.parentNode || false;
    }
    return el !== false;
};

/**
 * Check if element is in a specific context
 * and return state as boolean
 *
 * Todo: merge with hasParent
 * @param {Object} elem - Element, which will be checked
 * @param {Object} context - Context element, in which our element could persists
 *
 * @return {boolean}
 */
Helpers.checkElementInContext = function (elem, context) {
    var currentNode = elem;
    var contextNode = context || context;

    while (currentNode.parentNode) {
        currentNode = currentNode.parentNode;

        if (Helpers.checkNodeEquality(currentNode, contextNode)) {
            return true;
        }
    }

    return false;
};

/**
 * Check if node is really the same
 *
 * @param {Object} obj1 - Object, which we want to check
 * @param {Object} obj2 - Element, which we want to check against equality
 *
 * @return {boolean}
 */
Helpers.checkNodeEquality = function (obj1, obj2) {
    return obj1 === obj2;
};

/**
 * Check if element is in viewport
 *
 * @param {Object} elem - Object, which we want to check
 * @param {boolean} useBounds - if true, whole element must be visible
 *
 * @return {boolean}
 */
Helpers.isInViewport = function (elem, useBounds) {
    var el = elem;
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;
    var cond = false;

    while (el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
    }

    if (useBounds) {
        cond = top >= window.pageYOffset && left >= window.pageXOffset && top + height <= window.pageYOffset + window.innerHeight && left + width <= window.pageXOffset + window.innerWidth;
    } else {
        cond = top < window.pageYOffset + window.innerHeight && left < window.pageXOffset + window.innerWidth && top + height > window.pageYOffset && left + width > window.pageXOffset;
    }

    return cond;
};

// ----------------------------------
// LAYOUT HELPERS
// ----------------------------------

/**
 * Calculates the outer height for the given DOM element, including the
 * contributions of margin.
 *
 * @param {Object} elem - the element of which to calculate the outer height
 * @param {boolean} outer - add padding to height calculation
 *
 * @return {number}
 */
Helpers.getOuterHeight = function (elem, outer) {
    var el = elem;
    var height = el.offsetHeight;

    if (outer) {
        var style = getComputedStyle(el);
        height += parseInt(style.paddingTop) + parseInt(style.paddingBottom);
    }
    return height;
};

/**
 * Templatizer cleans up template tags and insert the inner html before the tag
 *
 * @param {Object} obj - Contains all properties
 * @param {string} obj.templateName - Defines the template name which is a selector from the element
 */
Helpers.templatizer = function (obj) {
    if (!'content' in document.createElement('template')) return;
    if (!obj && !obj.templateName) throw new Error('You need to pass a template namespace as string!');

    Helpers.querySelectorArray(obj.templateName).forEach(function (tpl) {
        var parent = tpl.parentNode;
        var content = tpl.content.children[0];

        parent.insertBefore(content, tpl);
    });
};

// ----------------------------------
// OTHER HELPERS
// ----------------------------------

/**
 * Determine click handler.
 *
 * @return {string}
 */
Helpers.clickHandler = function () {
    return Helpers.isTouch() ? 'touchstart' : 'click';
};

/**
 * Check if script is already added,
 * and returns true or false
 *
 * @param {string} url - URL to your script
 *
 * @return {boolean}
 */
Helpers.checkScript = function (url) {
    var x = document.getElementsByTagName("script");
    var scriptAdded = false;

    for (var i = 0; i < x.length; i++) {
        if (x[i].src == url) {
            scriptAdded = true;
        }
    }
    return scriptAdded;
};

/**
 * Load scripts asynchronous,
 * check if script is already added,
 * optional check if script is fully loaded and
 * execute callback function.
 *
 * @param {string} url - URL to your script
 * @param {function} callbackFn - callback function
 * @param {Object} callbackObj - this context
 */
Helpers.loadScript = function (url, callbackFn, callbackObj) {
    var scriptAdded = Helpers.checkScript(url);
    var script = void 0;

    if (scriptAdded === false) {
        script = document.createElement("script");
        script.src = url;
        document.body.appendChild(script);
    }

    if (callbackFn && typeof callbackFn === "function") {
        if (scriptAdded === true) {
            callbackFn.apply(callbackObj);
        } else {
            script.onreadystatechange = function () {
                if (x.readyState == 'complete') {
                    callbackFn.apply(callbackObj);
                }
            };
            script.onload = function () {
                callbackFn.apply(callbackObj);
            };
        }
    }

    return false;
};

/**
 * Add/Update multiple parameters for given url
 *
 * @param {String} url - url on which parameters should be added / updated
 * @param {Object} params - parameters (name/value)
 *
 * @return {String} - resulting url
 */
Helpers.updateUrl = function (url, params) {
    var urlParts = url.split('?');
    var tmpParams = [];
    var originalParams = [];
    var newParams = [];
    var baseUrl = '';
    var property = '';
    var updated = false;
    var i = 0;
    var j = 0;

    for (property in params) {
        if (params.hasOwnProperty(property)) {
            tmpParams.push([property, '=', params[property]].join(''));
        }
    }

    baseUrl = urlParts[0];
    originalParams = urlParts.length > 1 ? urlParts[1].split('&') : [];

    for (i; i < tmpParams.length; i++) {
        updated = false;

        for (j = 0; j < originalParams.length; j++) {
            if (tmpParams[i] && originalParams[j].split('=')[0] === tmpParams[i].split('=')[0]) {
                originalParams[j] = tmpParams[i];
                updated = true;
                break;
            }
        }

        if (!updated) {
            newParams.push(tmpParams[i]);
        }
    }

    return [baseUrl, '?', originalParams.concat(newParams).join('&')].join('');
};

/**
 * Get value of parameter for given url
 *
 * @param {String} url - given url
 * @param {String} param - parameter (name)
 *
 * @return {String|Boolean} - value of parameter
 */
Helpers.getParamFromUrl = function (url, param) {
    var urlParts = url.split('?');
    var originalParams = urlParts.length > 1 ? urlParts[1].split('&') : [];
    var i = 0;

    for (i; i < originalParams.length; i++) {

        if (originalParams[i].indexOf(param) === 0) {
            var keyVal = originalParams[i].split('=');

            return keyVal.length > 1 ? keyVal[1] : true;
        }
    }
};

/**
 * Generates numeric id.
 *
 * @param {Number} [segments=1] - number of segments of generated id (segments consist of 10 digits, separated by '-').
 *
 * @return {String} - generated id
 */
Helpers.makeId = function () {
    var segments = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var array = window.crypto.getRandomValues(new Uint32Array(segments));
    var id = '';
    var i = 0;

    for (; i < array.length; i++) {
        id += array[i] + '-';
    }

    return id.slice(0, -1);
};

/**
 * Detect swipe gestures
 *
 * @param {Object} el - element to detect swipes on
 * @param {Number} threshold - threshold for swipe (in px)
 */
Helpers.detectSwipe = function (el, threshold) {
    var touchstartX = 0;
    var touchstartY = 0;
    var touchendX = 0;
    var touchendY = 0;
    var swipeThreshold = threshold || 0;

    function handleSwipe() {
        var deltaX = Math.abs(touchstartX - touchendX);
        var deltaY = Math.abs(touchstartY - touchendY);

        if (deltaX > swipeThreshold) {
            if (touchendX < touchstartX) {
                el.dispatchEvent(new CustomEvent('swipe', {
                    detail: {
                        direction: 'left'
                    }
                }));
            }

            if (touchendX > touchstartX) {
                el.dispatchEvent(new CustomEvent('swipe', {
                    detail: {
                        direction: 'right'
                    }
                }));
            }
        }

        if (deltaY > swipeThreshold) {
            if (touchendY < touchstartY) {
                el.dispatchEvent(new CustomEvent('swipe', {
                    detail: {
                        direction: 'up'
                    }
                }));
            }

            if (touchendY > touchstartY) {
                el.dispatchEvent(new CustomEvent('swipe', {
                    detail: {
                        direction: 'down'
                    }
                }));
            }
        }
    }

    el.addEventListener('touchstart', function (e) {
        touchstartX = e.touches[0].clientX;
        touchstartY = e.touches[0].clientY;
    }, false);

    el.addEventListener('touchend', function (e) {
        touchendX = e.changedTouches[0].clientX;
        touchendY = e.changedTouches[0].clientY;

        handleSwipe();
    }, false);
};

exports.default = Helpers;

},{"./polyfills/custom-event":5}],5:[function(require,module,exports){
'use strict';

// Polyfill for custom events
(function () {
	if (typeof window.CustomEvent === 'function') return false;

	function CustomEvent(event, params) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt;
	}

	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
})();

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXNvdXJjZXMvanMvYXBwLmpzIiwicmVzb3VyY2VzL2pzL21haW4uanMiLCJyZXNvdXJjZXMvanMvdXRpbHMvZXZlbnRzLmpzIiwicmVzb3VyY2VzL2pzL3V0aWxzL2hlbHBlcnMuanMiLCJyZXNvdXJjZXMvanMvdXRpbHMvcG9seWZpbGxzL2N1c3RvbS1ldmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUE7Ozs7QUFFQTs7Ozs7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBTSxjQUFjLFFBQVEsYUFBUixDQUFwQjs7QUFFQSxRQUFRLFdBQVI7O2tCQUVnQixZQUFXO0FBQ3ZCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFDQSxRQUFJLE9BQU8sTUFBWDtBQUNBLFNBQUssUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUssUUFBTCxDQUFjLENBQWQsR0FBa0IsQ0FBbEI7O0FBRUE7QUFDQSxRQUFJLE1BQU0sS0FBSyxHQUFMLEdBQVcsa0JBQVEsTUFBUixDQUFlLE9BQU8sR0FBUCxJQUFjLEVBQTdCLEVBQWlDO0FBQ2xELGNBQU0sa0JBQVEsTUFBUixDQUFlLEVBQWYsRUFBbUIsWUFBWSxNQUEvQjtBQUQ0QyxLQUFqQyxDQUFyQjs7QUFJQTtBQUNBLFFBQUksV0FBSixHQUFrQixXQUFsQjtBQUNBLFFBQUksQ0FBSixHQUFRLENBQVI7QUFDQSxRQUFJLE1BQUo7O0FBRUE7Ozs7O0FBS0EsUUFBSSxhQUFKLEdBQW9CLFVBQVMsT0FBVCxFQUFrQjtBQUNsQyxvQkFBWSxJQUFaLENBQWlCLElBQWpCLENBQXNCLElBQXRCLEVBQTRCLE9BQTVCO0FBQ0gsS0FGRDtBQUdBLFFBQUksY0FBSixHQUFxQixVQUFTLE9BQVQsRUFBa0I7QUFDbkMsb0JBQVksS0FBWixDQUFrQixJQUFsQixDQUF1QixJQUF2QixFQUE2QixPQUE3QjtBQUNI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RUFBYSxPQUEzQjtBQUNBLHNCQUFjLEVBQUUsT0FBRixDQUFVLENBQVYsRUFBYSxPQUEzQjtBQUNILEtBSEQsRUFHRyxLQUhIOztBQUtBLE9BQUcsZ0JBQUgsQ0FBb0IsVUFBcEIsRUFBZ0MsVUFBUyxDQUFULEVBQVk7QUFDeEMsb0JBQVksRUFBRSxjQUFGLENBQWlCLENBQWpCLEVBQW9CLE9BQWhDO0FBQ0Esb0JBQVksRUFBRSxjQUFGLENBQWlCLENBQWpCLEVBQW9CLE9BQWhDOztBQUVBO0FBRUgsS0FORCxFQU1HLEtBTkg7QUFPSCxDQTVERDs7a0JBOERlLE87Ozs7O0FDcHFCZjtBQUNBLENBQUMsWUFBWTtBQUNaLEtBQUksT0FBTyxPQUFPLFdBQWQsS0FBOEIsVUFBbEMsRUFBOEMsT0FBTyxLQUFQOztBQUU5QyxVQUFTLFdBQVQsQ0FBcUIsS0FBckIsRUFBNEIsTUFBNUIsRUFBb0M7QUFDbkMsV0FBUyxVQUFVLEVBQUMsU0FBUyxLQUFWLEVBQWlCLFlBQVksS0FBN0IsRUFBb0MsUUFBUSxTQUE1QyxFQUFuQjtBQUNBLE1BQUksTUFBTSxTQUFTLFdBQVQsQ0FBcUIsYUFBckIsQ0FBVjtBQUNBLE1BQUksZUFBSixDQUFvQixLQUFwQixFQUEyQixPQUFPLE9BQWxDLEVBQTJDLE9BQU8sVUFBbEQsRUFBOEQsT0FBTyxNQUFyRTtBQUNBLFNBQU8sR0FBUDtBQUNBOztBQUVELGFBQVksU0FBWixHQUF3QixPQUFPLEtBQVAsQ0FBYSxTQUFyQzs7QUFFQSxRQUFPLFdBQVAsR0FBcUIsV0FBckI7QUFDQSxDQWJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBIZWxwZXJzIGZyb20gJy4vdXRpbHMvaGVscGVycyc7XG5cbmltcG9ydCBFVkVOVFMgZnJvbSAnLi91dGlscy9ldmVudHMnO1xuXG5jb25zdCAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5jb25zdCBFeG9za2VsZXRvbiA9IHJlcXVpcmUoJ2V4b3NrZWxldG9uJyk7XG5cbnJlcXVpcmUoJ3Jlc3BpbWFnZScpO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEdMT0JBTCBOQU1FU1BBQ0VcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBTYXZlIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0XG4gICAgbGV0IHJvb3QgPSB3aW5kb3c7XG4gICAgcm9vdC5CYWNrYm9uZSA9IHt9O1xuICAgIHJvb3QuQmFja2JvbmUuJCA9ICQ7XG5cbiAgICAvLyBAYm9ycm93IG9iamVjdHNcbiAgICBsZXQgQXBwID0gcm9vdC5BcHAgPSBIZWxwZXJzLmV4dGVuZCh3aW5kb3cuQXBwIHx8IHt9LCB7XG4gICAgICAgIFZlbnQ6IEhlbHBlcnMuZXh0ZW5kKHt9LCBFeG9za2VsZXRvbi5FdmVudHMpXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgZ2xvYmFsc1xuICAgIEFwcC5FeG9za2VsZXRvbiA9IEV4b3NrZWxldG9uO1xuICAgIEFwcC4kID0gJDtcbiAgICBBcHAuRVZFTlRTID0gRVZFTlRTO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGN1c3RvbSB2aWV3IHdpdGggb3duIHByb3BlcnRpZXMgYW5kXG4gICAgICogdGFrZSB0aGlzIHZpZXcgaW4gb3VyIG1vZHVsZXNcbiAgICAgKiByZWdpc3RlciBvbmx5IG9uZSByZWZlcmVuY2UgdG8gb3VyIGdsb2JhbCBsaWJyYXJ5IEV4b3NrZWxldG9uXG4gICAgICovXG4gICAgQXBwLkNvbXBvbmVudFZpZXcgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIEV4b3NrZWxldG9uLlZpZXcuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB9O1xuICAgIEFwcC5Db21wb25lbnRNb2RlbCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgRXhvc2tlbGV0b24uTW9kZWwuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB9O1xuICAgIEFwcC5Db21wb25lbnRDb2xsZWN0aW9uID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBFeG9za2VsZXRvbi5Db2xsZWN0aW9uLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIEhlbHBlcnMuZXh0ZW5kKEFwcC5Db21wb25lbnRWaWV3LnByb3RvdHlwZSwgRXhvc2tlbGV0b24uVmlldy5wcm90b3R5cGUsIHt9KTtcbiAgICBIZWxwZXJzLmV4dGVuZChBcHAuQ29tcG9uZW50TW9kZWwucHJvdG90eXBlLCBFeG9za2VsZXRvbi5Nb2RlbC5wcm90b3R5cGUsIHt9KTtcbiAgICBIZWxwZXJzLmV4dGVuZChBcHAuQ29tcG9uZW50Q29sbGVjdGlvbi5wcm90b3R5cGUsIEV4b3NrZWxldG9uLkNvbGxlY3Rpb24ucHJvdG90eXBlLCB7fSk7XG5cbiAgICBBcHAuQ29tcG9uZW50Vmlldy5leHRlbmQgPSBFeG9za2VsZXRvbi5WaWV3LmV4dGVuZDtcbiAgICBBcHAuQ29tcG9uZW50TW9kZWwuZXh0ZW5kID0gRXhvc2tlbGV0b24uTW9kZWwuZXh0ZW5kO1xuICAgIEFwcC5Db21wb25lbnRDb2xsZWN0aW9uLmV4dGVuZCA9IEV4b3NrZWxldG9uLkNvbGxlY3Rpb24uZXh0ZW5kO1xuXG4gICAgLyoqXG4gICAgICogQWRkIG91ciBNaXhpbiB0byBvdXIgVmlldyBvYmplY3QuXG4gICAgICovXG4gICAgQXBwLkNvbXBvbmVudFZpZXcuY2xhc3NNaXhpbiA9IEhlbHBlcnMuY2xhc3NNaXhpbjtcblxuICAgIC8vIEZlYXR1cmUgZGV0ZWN0aW9uXG4gICAgQXBwLnN1cHBvcnQgPSBBcHAuc3VwcG9ydCB8fCB7fTtcbiAgICBBcHAuc3VwcG9ydC50b3VjaCA9IEhlbHBlcnMuaXNUb3VjaCgpO1xuICAgIEFwcC5jbGlja0hhbmRsZXIgPSBIZWxwZXJzLmNsaWNrSGFuZGxlcigpO1xuXG4gICAgLy8gVmVyc2lvbmluZ1xuICAgIEFwcC52ZXJzaW9uID0gXCIwLjAuMVwiO1xuXG4gICAgLy8gR2xvYmFsIG1vZHVsZSByZWdpc3RyeVxuICAgIEFwcC5tb2R1bGVzID0ge307XG5cbiAgICAvLyBBZGQgbW9kdWxlIHRvIGdsb2JhbCByZWdpc3RyeVxuICAgIEFwcC5yZWdpc3Rlck1vZHVsZSA9IGZ1bmN0aW9uKG1vZHVsZSwgZWwpIHtcbiAgICAgICAgaWYgKCFBcHAubW9kdWxlc1ttb2R1bGUubmFtZV0pIHtcbiAgICAgICAgICAgIEFwcC5tb2R1bGVzW21vZHVsZS5uYW1lXSA9IG1vZHVsZTtcbiAgICAgICAgICAgIEFwcC5tb2R1bGVzW21vZHVsZS5uYW1lXS5ub2RlcyA9IFtlbF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBBcHAubW9kdWxlc1ttb2R1bGUubmFtZV0ubm9kZXMucHVzaChlbCk7XG4gICAgICAgIH1cblxuICAgICAgICBBcHAuVmVudC50cmlnZ2VyKEFwcC5FVkVOVFMubW9kdWxlUmVnaXN0ZXJlZCwge1xuICAgICAgICAgICAgbW9kdWxlOiBtb2R1bGUsXG4gICAgICAgICAgICBlbDogZWxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIE1lZGlhIFF1ZXJ5XG4gICAgbGV0IGhlYWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdoZWFkJyk7XG4gICAgQXBwLmN1cnJlbnRNZWRpYSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGhlYWRbMF0sIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtZmFtaWx5Jyk7XG5cbiAgICAvLyBTY3JlZW4gU2l6ZVxuICAgIEFwcC5zY3JlZW5TaXplID0ge1xuICAgICAgICB3aWR0aDogcm9vdC5pbm5lcldpZHRoLFxuICAgICAgICBoZWlnaHQ6IHJvb3QuaW5uZXJIZWlnaHRcbiAgICB9O1xuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIENIRUNLSU5HXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICBpZiAoZG9jdW1lbnQubG9jYXRpb24uc2VhcmNoLmluZGV4T2YoJ2Rldm1vZGUnKSA+IC0xKSB7XG4gICAgICAgIEFwcC5kZXZtb2RlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoZG9jdW1lbnQubG9jYXRpb24uc2VhcmNoLmluZGV4T2YoJ2xvZ2dlcicpID4gLTEpIHtcbiAgICAgICAgQXBwLmxvZ2dlciA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gaGlkZSBhbGwgd2FybmluZ3MgYW5kIGxvZ3MgaWYgbm90IGluIGRldm1vZGVcbiAgICBpZiAoIUFwcC5kZXZtb2RlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nID0gY29uc29sZS53YXJuID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG5cbiAgICAvLyBhZGQgY29uc29sZSBvdXRwdXQgZWxlbWVudCAodHJpZ2dlcmVkIGJ5IHBhcmFtZXRlciAnZGV2bW9kZScgYW5kICdsb2dnZXInIGluIHVybClcbiAgICBpZiAoQXBwLmRldm1vZGUgJiYgQXBwLmxvZ2dlcikge1xuICAgICAgICBsZXQgbG9nZ2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG5cbiAgICAgICAgbG9nZ2VyLnNldEF0dHJpYnV0ZSgnaWQnLCAnbG9nZ2VyJyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9nZ2VyKTtcblxuICAgICAgICBjb25zb2xlLndyaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzW2ldID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbm5lckhUTUwgKz0gKEpTT04gJiYgSlNPTi5zdHJpbmdpZnkgPyBKU09OLnN0cmluZ2lmeShhcmd1bWVudHNbaV0sIHVuZGVmaW5lZCwgMikgOiBhcmd1bWVudHNbaV0pICsgJzxiciAvPic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmlubmVySFRNTCArPSBhcmd1bWVudHNbaV0gKyAnPGJyIC8+JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZ2dlci5pbm5lckhUTUwgKz0gJzxiciAvPic7XG4gICAgICAgICAgICBsb2dnZXIuc2Nyb2xsVG9wID0gbG9nZ2VyLnNjcm9sbEhlaWdodDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zb2xlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5uZXJIVE1MICs9ICdbRXJyb3JdPGJyIC8+JztcbiAgICAgICAgICAgIGNvbnNvbGUud3JpdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zb2xlLndhcm4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbm5lckhUTUwgKz0gJ1tXYXJuXTxiciAvPic7XG4gICAgICAgICAgICBjb25zb2xlLndyaXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS5sb2cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbm5lckhUTUwgKz0gJ1tMb2ddPGJyIC8+JztcbiAgICAgICAgICAgIGNvbnNvbGUud3JpdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBHTE9CQUwgRVZFTlRTXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLyoqXG4gICAgICogVHJpZ2dlcnNcbiAgICAgKi9cblxuICAgIC8vIFRyaWdnZXIgZ2xvYmFsIHJlc2l6ZSBldmVudFxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRNZWRpYSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGhlYWRbMF0sIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgICAgIGxldCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXG4gICAgICAgIGlmIChjdXJyZW50TWVkaWEgIT09IEFwcC5jdXJyZW50TWVkaWEpIHtcbiAgICAgICAgICAgIGxldCBvbGRNZWRpYSA9IEFwcC5jdXJyZW50TWVkaWE7XG5cbiAgICAgICAgICAgIEFwcC5jdXJyZW50TWVkaWEgPSBjdXJyZW50TWVkaWE7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQXBwLmN1cnJlbnRNZWRpYTogJywgQXBwLmN1cnJlbnRNZWRpYSk7XG5cbiAgICAgICAgICAgIEFwcC5WZW50LnRyaWdnZXIoQXBwLkVWRU5UUy5tZWRpYWNoYW5nZSwge1xuICAgICAgICAgICAgICAgIHR5cGU6IEFwcC5FVkVOVFMubWVkaWFjaGFuZ2UsXG4gICAgICAgICAgICAgICAgY3VycmVudE1lZGlhOiBjdXJyZW50TWVkaWEsXG4gICAgICAgICAgICAgICAgb2xkTWVkaWE6IG9sZE1lZGlhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aWR0aCAhPSBBcHAuc2NyZWVuU2l6ZS53aWR0aCkge1xuICAgICAgICAgICAgQXBwLnNjcmVlblNpemUud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIEFwcC5WZW50LnRyaWdnZXIoQXBwLkVWRU5UUy5yZXNpemUsIGUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRvY3VtZW50Lm9uc2Nyb2xsID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBBcHAuVmVudC50cmlnZ2VyKEFwcC5FVkVOVFMuc2Nyb2xsLCBlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEFwcDtcblxufSkuY2FsbCh0aGlzKTsiLCIvLyBNYWluIFJlcXVpcmVtZW50c1xuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCc7XG5pbXBvcnQgSGVscGVycyBmcm9tICcuL3V0aWxzL2hlbHBlcnMnO1xuXG4vLyBFUzYgTW9kdWxlc1xuXG4vLyBASU5TRVJUUE9JTlQgOjogQHJlZjoganMtaW1wb3J0XG5cbi8vIFZhcnNcbmNvbnN0ICQgPSBBcHAuJDtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNYWluIEZ1bmN0aW9uYWxpdHlcbmNsYXNzIENvcmUge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIG91ciBjb3JlIGZ1bmN0aW9uYWxpdHlcblx0ICogVGhpcyBmdW5jdGlvbiB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb25jZS5cblx0ICovXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0Y29uc29sZS5sb2coJ0FwcCBpbml0aWFsaXplZCB3aXRoIHZlcnNpb246ICcsIEFwcC52ZXJzaW9uKTtcblxuXHRcdC8qKlxuXHRcdCAqIERldGVjdCBUb3VjaFxuXHRcdCAqL1xuXHRcdGlmICghQXBwLnN1cHBvcnQudG91Y2gpIHtcblx0XHRcdCQoJ2h0bWwnKS5hZGRDbGFzcygnbm8tdG91Y2gnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnaHRtbCcpLmFkZENsYXNzKCd0b3VjaCcpO1xuXHRcdH1cblxuXHRcdC8vIFJlZGlyZWN0XG5cdFx0QXBwLlZlbnQub24oQXBwLkVWRU5UUy5ET01yZWRpcmVjdCwgKG9iaikgPT4ge1xuXHRcdFx0aWYgKCFvYmogJiYgIW9iai51cmwpIHRocm93IG5ldyBFcnJvcignT2JqZWN0IGlzIG5vdCBkZWZpbmVkLiBQbGVhc2UgcHJvdmlkZSBhbiB1cmwgaW4geW91ciBvYmplY3QhJyk7XG5cblx0XHRcdC8vIFJlZGlyZWN0IHRvIHBhZ2Vcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gU3RyaW5nKG9iai51cmwpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQElOU0VSVFBPSU5UIDo6IEByZWY6IGpzLWluaXQtb25jZS12M1xuXG5cdH1cblxuXHRwcmVSZW5kZXIoKSB7XG5cdFx0SGVscGVycy5zYXZlRE9NKCk7XG5cdH1cblxuXHRyZW5kZXIoY29udGV4dCkge1xuXHRcdC8vIEBJTlNFUlRQT0lOVCA6OiBAcmVmOiBqcy1pbml0LXYzXG5cblx0fVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoKSB7XG5cdGxldCBjb3JlID0gbmV3IENvcmUoKTtcblxuXHQvKipcblx0ICogUmVuZGVyIG1vZHVsZXNcblx0ICovXG5cdGNvcmUucHJlUmVuZGVyKCk7XG5cdGNvcmUucmVuZGVyKGRvY3VtZW50KTtcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBtb2R1bGVzIHdoaWNoIGFyZSBsb2FkZWQgYWZ0ZXIgaW5pdGlhbCBsb2FkXG5cdCAqIHZpYSBjdXN0b20gZXZlbnQgJ0RPTWNoYW5nZWQnXG5cdCAqL1xuXHRBcHAuVmVudC5vbihBcHAuRVZFTlRTLkRPTWNoYW5nZWQsIChjb250ZXh0KSA9PiB7XG5cdFx0Y29uc29sZS5sb2coJ0RvbSBoYXMgY2hhbmdlZC4gSW5pdGlhbGlzaW5nIG5ldyBtb2R1bGVzIGluOiAnLCBjb250ZXh0KTtcblx0XHRjb3JlLnByZVJlbmRlcigpO1xuXHRcdGNvcmUucmVuZGVyKGNvbnRleHQpO1xuXHR9KTtcbn0pOyIsIi8qKlxuICogQ29uc3QgZm9yIGV2ZW50cyAocHViL3N1YilcbiAqXG4gKiBAYXV0aG9yOiBTZWJhc3RpYW4gRml0em5lclxuICovXG5cbi8qKlxuICogRXZlbnRzIEdsb2JhbFxuICovXG5cbmNvbnN0IEVWRU5UUyA9IHtcblx0Ymx1cjogJ2JsdXInLFxuXHRjaGFuZ2U6ICdjaGFuZ2UnLFxuXHRjbGljazogJ2NsaWNrJyxcblx0ZGJsY2xpY2s6ICdkYmxjbGljaycsXG5cdERPTWNoYW5nZWQ6ICdET01jaGFuZ2VkJyxcblx0RE9NcmVkaXJlY3Q6ICdkb206cmVkaXJlY3QnLFxuXHRoYXNoY2hhbmdlOiAnaGFzaGNoYW5nZScsXG5cdGlucHV0OiAnaW5wdXQnLFxuXHRrZXlkb3duOiAna2V5ZG93bicsXG5cdGtleXByZXNzOiAna2V5cHJlc3MnLFxuXHRrZXl1cDogJ2tleXVwJyxcblx0bWVkaWFjaGFuZ2U6ICdtZWRpYWNoYW5nZScsXG5cdG1vZHVsZVJlZ2lzdGVyZWQ6ICdtb2R1bGVSZWdpc3RlcmVkJyxcblx0bW91c2Vkb3duOiAnbW91c2Vkb3duJyxcblx0bW91c2VlbnRlcjogJ21vdXNlZW50ZXInLFxuXHRtb3VzZWxlYXZlOiAnbW91c2VsZWF2ZScsXG5cdG1vdXNlb3V0OiAnbW91c2VvdXQnLFxuXHRtb3VzZW92ZXI6ICdtb3VzZW92ZXInLFxuXHRtb3VzZXVwOiAnbW91c2V1cCcsXG5cdHJlc2V0OiAncmVzZXQnLFxuXHRyZXNpemU6ICdyZXNpemUnLFxuXHRzY3JvbGw6ICdzY3JvbGwnLFxuXHRzdWJtaXQ6ICdzdWJtaXQnLFxuXHRzd2lwZTogJ3N3aXBlJ1xufTtcblxuLy8gQElOU0VSVFBPSU5UIDo6IEByZWY6IGpzLWV2ZW50c1xuXG5leHBvcnQgZGVmYXVsdCBFVkVOVFM7XG4iLCIvKipcbiAqIFJlcHJlc2VudHMgYSBIZWxwZXIgT2JqZWN0LlxuICogQG1vZHVsZSBIZWxwZXJcbiAqXG4gKiBAYXV0aG9yIFNlYmFzdGlhbiBGaXR6bmVyXG4gKiBAYXV0aG9yIEFuZHkgR3V0c2NoZVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBJbXBvcnRzXG4gKi9cbmltcG9ydCAnLi9wb2x5ZmlsbHMvY3VzdG9tLWV2ZW50JztcblxuXG4vLyBAYWxpYXMgbW9kdWxlOiBIZWxwZXJzXG5cbmxldCBIZWxwZXJzID0ge307XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1PRFVMRSBIRUxQRVJTXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2F2ZS9VcGRhdGUgRE9NIHJlZmVyZW5jZXMgZm9yIEpTIE1vZHVsZXNcbiAqXG4gKlxuICovXG5IZWxwZXJzLnNhdmVET00gPSBmdW5jdGlvbigpIHtcbiAgICBIZWxwZXJzLmRhdGFKc01vZHVsZXMgPSBIZWxwZXJzLnF1ZXJ5U2VsZWN0b3JBcnJheSgnW2RhdGEtanMtbW9kdWxlXScpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbW9kdWxlIGFuZCByZW5kZXIgaXQgYW5kL29yIHByb3ZpZGUgYSBjYWxsYmFjayBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogLSBEZWZpbml0aW9uIG9mIG91ciBtb2R1bGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBvYmouZWwgLSBSZXF1aXJlZDogZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IG9iai5Nb2R1bGUgLSBSZXF1aXJlZDogY2xhc3Mgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHJlbmRlciB5b3VyIG1vZHVsZVxuICogQHBhcmFtIHtib29sZWFufSBbb2JqLnJlbmRlcj10cnVlXSAtIE9wdGlvbmFsOiByZW5kZXIgdGhlIGNsYXNzLCBpZiBmYWxzZSB0aGUgY2xhc3Mgd2lsbCBvbmx5IGJlIGluaXRpYWxpemVkXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBbb2JqLmNiXSAtIE9wdGlvbmFsOiBwcm92aWRlIGEgZnVuY3Rpb24gd2hpY2ggd2lsbCBiZSBleGVjdXRlZCBhZnRlciBpbml0aWFsaXNhdGlvblxuICogQHBhcmFtIHtPYmplY3R9IFtvYmouY29udGV4dF0gLSBPcHRpb25hbDogY29udGV4dCBvZiBtb2R1bGVcbiAqXG4gKi9cbkhlbHBlcnMubG9hZE1vZHVsZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqLmRvbU5hbWUpIHRocm93IG5ldyBFcnJvcignSW4gb3JkZXIgdG8gd29yayB3aXRoIGxvYWRNb2R1bGUgeW91IG5lZWQgdG8gZGVmaW5lIHRoZSBtb2R1bGUgbmFtZSAoZGVmaW5lZCBpbiBkYXRhLWpzLW1vZHVsZSBhdHRyaWJ1dGUpIGFzIHN0cmluZyEgJyk7XG4gICAgaWYgKCFvYmoubW9kdWxlKSB0aHJvdyBuZXcgRXJyb3IoJ0luIG9yZGVyIHRvIHdvcmsgd2l0aCBsb2FkTW9kdWxlIHlvdSBuZWVkIHRvIGRlZmluZSBhIE1vZHVsZSEnKTtcblxuICAgIGxldCBjb250ZXh0ID0gb2JqLmNvbnRleHQgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xuICAgIGxldCByZW5kZXJPbkluaXQgPSBvYmoucmVuZGVyICE9PSBmYWxzZTtcblxuXG4gICAgSGVscGVycy5mb3JFYWNoKEhlbHBlcnMuZGF0YUpzTW9kdWxlcywgKGksIGVsKSA9PiB7XG4gICAgICAgIGxldCBkYXRhTW9kdWxlcyA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1qcy1tb2R1bGUnKS5zcGxpdCgnICcpO1xuXG4gICAgICAgIGlmIChkYXRhTW9kdWxlcy5pbmRleE9mKG9iai5kb21OYW1lKSAhPSAtMSAmJiBIZWxwZXJzLmNoZWNrRWxlbWVudEluQ29udGV4dChlbCwgY29udGV4dCkpIHtcbiAgICAgICAgICAgIGxldCBhdHRycyA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1qcy1vcHRpb25zJyk7XG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IEpTT04ucGFyc2UoYXR0cnMpO1xuICAgICAgICAgICAgbGV0IG1vZHVsZSA9IG5ldyBvYmoubW9kdWxlKHtcbiAgICAgICAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFJlbmRlciBhZnRlciBpbml0aWFsIG1vZHVsZSBsb2FkaW5nXG4gICAgICAgICAgICBpZiAocmVuZGVyT25Jbml0KSBtb2R1bGUucmVuZGVyKCk7XG4gICAgICAgICAgICAvLyBQcm92aWRlIGNhbGxiYWNrIGZ1bmN0aW9uIGluIHdoaWNoIHlvdSBjYW4gdXNlIG1vZHVsZSBhbmQgb3B0aW9uc1xuICAgICAgICAgICAgaWYgKG9iai5jYiAmJiB0eXBlb2Yob2JqLmNiKSA9PT0gXCJmdW5jdGlvblwiKSBvYmouY2IobW9kdWxlLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRVhURU5ESU5HIEhFTFBFUlNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTaW1wbGUgZXh0ZW5kIG1ldGhvZCB0byBleHRlbmQgdGhlIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogLSBvYmplY3Qgd2hpY2ggd2lsbCBiZSBleHRlbmRlZFxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gb2JqIC0gZXh0ZW5kZWQgb2JqZWN0XG4gKi9cbkhlbHBlcnMuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kKG9iaikge1xuICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBpdGVtKSBvYmpba2V5XSA9IGl0ZW1ba2V5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xufTtcblxuLyoqXG4gKiBTaW1wbGUgZXh0ZW5kIG1ldGhvZCwgd2hpY2ggZXh0ZW5kcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiAtIG9iamVjdCB3aGljaCB3aWxsIGJlIGV4dGVuZGVkXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBvYmogLSBleHRlbmRlZCBvYmplY3RcbiAqL1xuSGVscGVycy5kZWZhdWx0cyA9IGZ1bmN0aW9uIGRlZmF1bHRzKG9iaikge1xuICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBpdGVtKSB7XG4gICAgICAgICAgICBpZiAob2JqW2tleV0gPT09IHVuZGVmaW5lZCkgb2JqW2tleV0gPSBpdGVtW2tleV07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xufTtcblxuLyoqXG4gKiBNZXJnZSBtZXRob2QgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBmcm9tIC0gTWl4aW4gb2JqZWN0IHdoaWNoIHdpbGwgYmUgbWVyZ2VkIHZpYSBIZWxwZXJzLmRlZmF1bHRzIHdpdGggdGhlIG1ldGhvZHMgb2Ygb3VyIGNsYXNzXG4gKiBAcGFyYW0ge0FycmF5fSBtZXRob2RzIC0gQXJyYXkgb2YgbWV0aG9kIG5hbWVzIHdoaWNoIHdpbGwgYmUgZXh0ZW5kZWQuXG4gKi9cbkhlbHBlcnMuY2xhc3NNaXhpbiA9IGZ1bmN0aW9uKGZyb20sIG1ldGhvZHMgPSBbJ2luaXRpYWxpemUnLCAncmVuZGVyJ10pIHtcblxuICAgIGxldCB0byA9IHRoaXMucHJvdG90eXBlO1xuXG4gICAgLyoqIEFkZCB0aG9zZSBtZXRob2RzIHdoaWNoIGV4aXN0cyBvbiBgZnJvbWAgYnV0IG5vdCBvbiBgdG9gIHRvIHRoZSBsYXR0ZXIgKi9cbiAgICBIZWxwZXJzLmRlZmF1bHRzKHRvLCBmcm9tKTtcblxuICAgIC8qKiB3ZSBkbyB0aGUgc2FtZSBmb3IgZXZlbnRzICovXG4gICAgaWYgKHRvLmV2ZW50cykge1xuICAgICAgICBIZWxwZXJzLmRlZmF1bHRzKHRvLmV2ZW50cywgZnJvbS5ldmVudHMpO1xuICAgIH1cblxuICAgIC8vIEV4dGVuZCB0bydzIG1ldGhvZHNcbiAgICBtZXRob2RzLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgICBIZWxwZXJzLmV4dGVuZE1ldGhvZCh0bywgZnJvbSwgbWV0aG9kKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogSGVscGVyIG1ldGhvZCB0byBleHRlbmQgYW4gYWxyZWFkeSBleGlzdGluZyBtZXRob2QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHRvIC0gdmlldyB3aGljaCB3aWxsIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gZnJvbSAtIG1ldGhvZHMgd2hpY2ggY29tZXMgZnJvbSBtaXhpblxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZE5hbWUgLSBmdW5jdGlvbiBuYW1lXG4gKi9cbkhlbHBlcnMuZXh0ZW5kTWV0aG9kID0gZnVuY3Rpb24odG8sIGZyb20sIG1ldGhvZE5hbWUpIHtcbiAgICBmdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICd1bmRlZmluZWQnO1xuICAgIH1cblxuICAgIC8vIGlmIHRoZSBtZXRob2QgaXMgZGVmaW5lZCBvbiBmcm9tIC4uLlxuICAgIGlmICghaXNVbmRlZmluZWQoZnJvbVttZXRob2ROYW1lXSkpIHtcbiAgICAgICAgbGV0IG9sZCA9IHRvW21ldGhvZE5hbWVdO1xuXG4gICAgICAgIC8vIC4uLiB3ZSBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb24gdG9cbiAgICAgICAgdG9bbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gd2hlcmVpbiB3ZSBmaXJzdCBjYWxsIHRoZSBtZXRob2Qgd2hpY2ggZXhpc3RzIG9uIGB0b2BcbiAgICAgICAgICAgIGxldCBvbGRSZXR1cm4gPSBvbGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgLy8gYW5kIHRoZW4gY2FsbCB0aGUgbWV0aG9kIG9uIGBmcm9tYFxuICAgICAgICAgICAgZnJvbVttZXRob2ROYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAvLyBhbmQgdGhlbiByZXR1cm4gdGhlIGV4cGVjdGVkIHJlc3VsdCxcbiAgICAgICAgICAgIC8vIGkuZS4gd2hhdCB0aGUgbWV0aG9kIG9uIGB0b2AgcmV0dXJuc1xuICAgICAgICAgICAgcmV0dXJuIG9sZFJldHVybjtcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGVU5DVElPTkFMIEhFTFBFUlNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBHZXQgZG9tIGVsZW1lbnRzIGluIGFuIGFycmF5XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGVsZW0gLSBSZXF1aXJlZDogc2VsZWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbY29udGV4dF0gLSBPcHRpb25hbDogY29udGV4dFxuICpcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5IZWxwZXJzLnF1ZXJ5U2VsZWN0b3JBcnJheSA9IEhlbHBlcnMuJCA9IGZ1bmN0aW9uKGVsZW0sIGNvbnRleHQpIHtcbiAgICBpZiAoIWVsZW0pIHRocm93IG5ldyBFcnJvcignSW4gb3JkZXIgdG8gd29yayB3aXRoIHF1ZXJ5U2VsZWN0b3JBcnJheSB5b3UgbmVlZCB0byBkZWZpbmUgYW4gZWxlbWVudCBhcyBzdHJpbmchJyk7XG4gICAgbGV0IGVsID0gZWxlbTtcbiAgICBsZXQgY3VzdG9tQ29udGV4dCA9IGNvbnRleHQgfHwgZG9jdW1lbnQ7XG5cbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoKGN1c3RvbUNvbnRleHQpLnF1ZXJ5U2VsZWN0b3JBbGwoZWwpKTtcbn07XG5cbi8qKlxuICogU2ltcGxlIGZvckVhY2ggbWV0aG9kXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgLSBhcnJheSBvZiBvYmplY3RzXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc2NvcGUgLSBzY29wZSBvZiBmdW5jdGlvblxuICovXG5IZWxwZXJzLmZvckVhY2ggPSBmdW5jdGlvbihhcnJheSwgY2FsbGJhY2ssIHNjb3BlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHNjb3BlLCBpLCBhcnJheVtpXSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBGaW5kIGluZGV4IG9mIGEgc3BlY2lmaWMgaXRlbSBpbiBhbiBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSAtIGFycmF5IGluIHdoaWNoIHdlIHNlYXJjaCBmb3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIC0gaXRlbSB3aGljaCB3aWxsIGJlIHNlYXJjaGVkXG4gKi9cbkhlbHBlcnMuaW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICBsZXQgbDtcbiAgICBsZXQgaTtcblxuICAgIGZvciAoaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpKyspXG4gICAgICAgIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gbmV3IFJlZ0V4cFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWdFeCAtIFJlZ3VsYXIgRXhwcmVzc2lvblxuICpcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuSGVscGVycy5yZWdFeHAgPSBmdW5jdGlvbihyZWdFeCkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKFwiKF58XFxcXHMrKVwiICsgcmVnRXggKyBcIihcXFxccyt8JClcIik7XG59O1xuXG4vKipcbiAqIFRocm90dGxlIG1ldGhvZCBmb3IgcmVzaXplIGV2ZW50cyBhbmQgbW9yZVxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgLSBGdW5jdGlvbiB3aGljaCB3aWxsIGJlIGV4ZWN1dGVkLlxuICogQHBhcmFtIHtudW1iZXJ9IHdhaXQgLSBudW1iZXIgdG8gd2FpdCBpbiBtaWxsaXNlY29uZHMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGltbWVkaWF0ZSAtIGV4ZWN1dGUgZnVuY3Rpb24gaW1tZWRpYXRlbHkuXG4gKi9cblxuSGVscGVycy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIGxldCB0aW1lb3V0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgY29udGV4dCA9IHRoaXM7XG4gICAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICBsZXQgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgICAgbGV0IGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblxuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG5cbiAgICAgICAgaWYgKGNhbGxOb3cpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERFVEVDVElPTiBIRUxQRVJTXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVG91Y2ggRGV0ZWN0aW9uXG4gKi9cbkhlbHBlcnMuaXNUb3VjaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3c7XG59O1xuXG4vKipcbiAqIERldGVjdCB0cmFuc2l0aW9uZW5kIGV2ZW50LlxuICovXG5IZWxwZXJzLnRyYW5zaXRpb25FbmRFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0O1xuICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zha2VlbGVtZW50Jyk7XG4gICAgbGV0IHRyYW5zaXRpb25zID0ge1xuICAgICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgJ09UcmFuc2l0aW9uJzogJ29UcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnXG4gICAgfTtcblxuICAgIGZvciAodCBpbiB0cmFuc2l0aW9ucykge1xuICAgICAgICBpZiAoZWwuc3R5bGVbdF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25zW3RdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBEZXRlY3QgYW5pbWF0aW9uZW5kIGV2ZW50LlxuICovXG5IZWxwZXJzLmFuaW1hdGlvbkVuZEV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHQ7XG4gICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmFrZWVsZW1lbnQnKTtcbiAgICBsZXQgYW5pbWF0aW9ucyA9IHtcbiAgICAgICAgJ2FuaW1hdGlvbic6ICdhbmltYXRpb25lbmQnLFxuICAgICAgICAnT0FuaW1hdGlvbic6ICdvQW5pbWF0aW9uRW5kJyxcbiAgICAgICAgJ01vekFuaW1hdGlvbic6ICdhbmltYXRpb25lbmQnLFxuICAgICAgICAnV2Via2l0QW5pbWF0aW9uJzogJ3dlYmtpdEFuaW1hdGlvbkVuZCdcbiAgICB9O1xuXG4gICAgZm9yICh0IGluIGFuaW1hdGlvbnMpIHtcbiAgICAgICAgaWYgKGVsLnN0eWxlW3RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25zW3RdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBSZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZVxuICpcbiAqIEByZXR1cm4ge2Z1bmN0aW9ufVxuICovXG5IZWxwZXJzLnJlcXVlc3RBbmlGcmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgICAgIH07XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDSEVDSyBIRUxQRVJTXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogYmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2ludXlha3NhL2pxdWVyeS5uaWNlc2Nyb2xsL2Jsb2IvbWFzdGVyL2pxdWVyeS5uaWNlc2Nyb2xsLmpzXG4gKlxuICogVG9kbzogbWVyZ2Ugd2l0aCBjaGVja0VsZW1lbnRJbkNvbnRleHRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkhlbHBlcnMuaGFzUGFyZW50ID0gZnVuY3Rpb24oZSwgcCkge1xuICAgIGlmICghZSkgcmV0dXJuIGZhbHNlO1xuICAgIGxldCBlbCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCB8fCBlIHx8IGZhbHNlO1xuICAgIHdoaWxlIChlbCAmJiBlbCAhPSBwKSB7XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZSB8fCBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIChlbCAhPT0gZmFsc2UpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBlbGVtZW50IGlzIGluIGEgc3BlY2lmaWMgY29udGV4dFxuICogYW5kIHJldHVybiBzdGF0ZSBhcyBib29sZWFuXG4gKlxuICogVG9kbzogbWVyZ2Ugd2l0aCBoYXNQYXJlbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0gRWxlbWVudCwgd2hpY2ggd2lsbCBiZSBjaGVja2VkXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCAtIENvbnRleHQgZWxlbWVudCwgaW4gd2hpY2ggb3VyIGVsZW1lbnQgY291bGQgcGVyc2lzdHNcbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5IZWxwZXJzLmNoZWNrRWxlbWVudEluQ29udGV4dCA9IGZ1bmN0aW9uKGVsZW0sIGNvbnRleHQpIHtcbiAgICBsZXQgY3VycmVudE5vZGUgPSBlbGVtO1xuICAgIGxldCBjb250ZXh0Tm9kZSA9IGNvbnRleHQgfHwgY29udGV4dDtcblxuICAgIHdoaWxlIChjdXJyZW50Tm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucGFyZW50Tm9kZTtcblxuICAgICAgICBpZiAoSGVscGVycy5jaGVja05vZGVFcXVhbGl0eShjdXJyZW50Tm9kZSwgY29udGV4dE5vZGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgbm9kZSBpcyByZWFsbHkgdGhlIHNhbWVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSAtIE9iamVjdCwgd2hpY2ggd2Ugd2FudCB0byBjaGVja1xuICogQHBhcmFtIHtPYmplY3R9IG9iajIgLSBFbGVtZW50LCB3aGljaCB3ZSB3YW50IHRvIGNoZWNrIGFnYWluc3QgZXF1YWxpdHlcbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5IZWxwZXJzLmNoZWNrTm9kZUVxdWFsaXR5ID0gZnVuY3Rpb24ob2JqMSwgb2JqMikge1xuICAgIHJldHVybiAob2JqMSA9PT0gb2JqMik7XG59O1xuXG5cbi8qKlxuICogQ2hlY2sgaWYgZWxlbWVudCBpcyBpbiB2aWV3cG9ydFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0gT2JqZWN0LCB3aGljaCB3ZSB3YW50IHRvIGNoZWNrXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUJvdW5kcyAtIGlmIHRydWUsIHdob2xlIGVsZW1lbnQgbXVzdCBiZSB2aXNpYmxlXG4gKlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuSGVscGVycy5pc0luVmlld3BvcnQgPSBmdW5jdGlvbihlbGVtLCB1c2VCb3VuZHMpIHtcbiAgICBsZXQgZWwgPSBlbGVtO1xuICAgIGxldCB0b3AgPSBlbC5vZmZzZXRUb3A7XG4gICAgbGV0IGxlZnQgPSBlbC5vZmZzZXRMZWZ0O1xuICAgIGxldCB3aWR0aCA9IGVsLm9mZnNldFdpZHRoO1xuICAgIGxldCBoZWlnaHQgPSBlbC5vZmZzZXRIZWlnaHQ7XG4gICAgbGV0IGNvbmQgPSBmYWxzZTtcblxuICAgIHdoaWxlIChlbC5vZmZzZXRQYXJlbnQpIHtcbiAgICAgICAgZWwgPSBlbC5vZmZzZXRQYXJlbnQ7XG4gICAgICAgIHRvcCArPSBlbC5vZmZzZXRUb3A7XG4gICAgICAgIGxlZnQgKz0gZWwub2Zmc2V0TGVmdDtcbiAgICB9XG5cbiAgICBpZiAodXNlQm91bmRzKSB7XG4gICAgICAgIGNvbmQgPSB0b3AgPj0gd2luZG93LnBhZ2VZT2Zmc2V0ICYmIGxlZnQgPj0gd2luZG93LnBhZ2VYT2Zmc2V0ICYmICh0b3AgKyBoZWlnaHQpIDw9ICh3aW5kb3cucGFnZVlPZmZzZXQgKyB3aW5kb3cuaW5uZXJIZWlnaHQpICYmIChsZWZ0ICsgd2lkdGgpIDw9ICh3aW5kb3cucGFnZVhPZmZzZXQgKyB3aW5kb3cuaW5uZXJXaWR0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uZCA9IHRvcCA8ICh3aW5kb3cucGFnZVlPZmZzZXQgKyB3aW5kb3cuaW5uZXJIZWlnaHQpICYmIGxlZnQgPCAod2luZG93LnBhZ2VYT2Zmc2V0ICsgd2luZG93LmlubmVyV2lkdGgpICYmICh0b3AgKyBoZWlnaHQpID4gd2luZG93LnBhZ2VZT2Zmc2V0ICYmIChsZWZ0ICsgd2lkdGgpID4gd2luZG93LnBhZ2VYT2Zmc2V0O1xuICAgIH1cblxuICAgIHJldHVybiBjb25kO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTEFZT1VUIEhFTFBFUlNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBvdXRlciBoZWlnaHQgZm9yIHRoZSBnaXZlbiBET00gZWxlbWVudCwgaW5jbHVkaW5nIHRoZVxuICogY29udHJpYnV0aW9ucyBvZiBtYXJnaW4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSB0aGUgZWxlbWVudCBvZiB3aGljaCB0byBjYWxjdWxhdGUgdGhlIG91dGVyIGhlaWdodFxuICogQHBhcmFtIHtib29sZWFufSBvdXRlciAtIGFkZCBwYWRkaW5nIHRvIGhlaWdodCBjYWxjdWxhdGlvblxuICpcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuSGVscGVycy5nZXRPdXRlckhlaWdodCA9IGZ1bmN0aW9uKGVsZW0sIG91dGVyKSB7XG4gICAgbGV0IGVsID0gZWxlbTtcbiAgICBsZXQgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xuXG4gICAgaWYgKG91dGVyKSB7XG4gICAgICAgIGxldCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xuICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUucGFkZGluZ1RvcCkgKyBwYXJzZUludChzdHlsZS5wYWRkaW5nQm90dG9tKTtcbiAgICB9XG4gICAgcmV0dXJuIGhlaWdodDtcbn07XG5cbi8qKlxuICogVGVtcGxhdGl6ZXIgY2xlYW5zIHVwIHRlbXBsYXRlIHRhZ3MgYW5kIGluc2VydCB0aGUgaW5uZXIgaHRtbCBiZWZvcmUgdGhlIHRhZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogLSBDb250YWlucyBhbGwgcHJvcGVydGllc1xuICogQHBhcmFtIHtzdHJpbmd9IG9iai50ZW1wbGF0ZU5hbWUgLSBEZWZpbmVzIHRoZSB0ZW1wbGF0ZSBuYW1lIHdoaWNoIGlzIGEgc2VsZWN0b3IgZnJvbSB0aGUgZWxlbWVudFxuICovXG5IZWxwZXJzLnRlbXBsYXRpemVyID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCEnY29udGVudCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKSkgcmV0dXJuO1xuICAgIGlmICghb2JqICYmICFvYmoudGVtcGxhdGVOYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHBhc3MgYSB0ZW1wbGF0ZSBuYW1lc3BhY2UgYXMgc3RyaW5nIScpO1xuXG4gICAgSGVscGVycy5xdWVyeVNlbGVjdG9yQXJyYXkob2JqLnRlbXBsYXRlTmFtZSkuZm9yRWFjaChmdW5jdGlvbih0cGwpIHtcbiAgICAgICAgbGV0IHBhcmVudCA9IHRwbC5wYXJlbnROb2RlO1xuICAgICAgICBsZXQgY29udGVudCA9IHRwbC5jb250ZW50LmNoaWxkcmVuWzBdO1xuXG4gICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY29udGVudCwgdHBsKTtcbiAgICB9KTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE9USEVSIEhFTFBFUlNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBEZXRlcm1pbmUgY2xpY2sgaGFuZGxlci5cbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbkhlbHBlcnMuY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhlbHBlcnMuaXNUb3VjaCgpID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJztcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgc2NyaXB0IGlzIGFscmVhZHkgYWRkZWQsXG4gKiBhbmQgcmV0dXJucyB0cnVlIG9yIGZhbHNlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFVSTCB0byB5b3VyIHNjcmlwdFxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkhlbHBlcnMuY2hlY2tTY3JpcHQgPSBmdW5jdGlvbih1cmwpIHtcbiAgICBsZXQgeCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuICAgIGxldCBzY3JpcHRBZGRlZCA9IGZhbHNlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh4W2ldLnNyYyA9PSB1cmwpIHtcbiAgICAgICAgICAgIHNjcmlwdEFkZGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2NyaXB0QWRkZWQ7XG59O1xuXG4vKipcbiAqIExvYWQgc2NyaXB0cyBhc3luY2hyb25vdXMsXG4gKiBjaGVjayBpZiBzY3JpcHQgaXMgYWxyZWFkeSBhZGRlZCxcbiAqIG9wdGlvbmFsIGNoZWNrIGlmIHNjcmlwdCBpcyBmdWxseSBsb2FkZWQgYW5kXG4gKiBleGVjdXRlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBVUkwgdG8geW91ciBzY3JpcHRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrRm4gLSBjYWxsYmFjayBmdW5jdGlvblxuICogQHBhcmFtIHtPYmplY3R9IGNhbGxiYWNrT2JqIC0gdGhpcyBjb250ZXh0XG4gKi9cbkhlbHBlcnMubG9hZFNjcmlwdCA9IGZ1bmN0aW9uKHVybCwgY2FsbGJhY2tGbiwgY2FsbGJhY2tPYmopIHtcbiAgICBsZXQgc2NyaXB0QWRkZWQgPSBIZWxwZXJzLmNoZWNrU2NyaXB0KHVybCk7XG4gICAgbGV0IHNjcmlwdDtcblxuICAgIGlmIChzY3JpcHRBZGRlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFja0ZuICYmIHR5cGVvZihjYWxsYmFja0ZuKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChzY3JpcHRBZGRlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY2FsbGJhY2tGbi5hcHBseShjYWxsYmFja09iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHgucmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4uYXBwbHkoY2FsbGJhY2tPYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tGbi5hcHBseShjYWxsYmFja09iaik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG4vKipcbiAqIEFkZC9VcGRhdGUgbXVsdGlwbGUgcGFyYW1ldGVycyBmb3IgZ2l2ZW4gdXJsXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybCAtIHVybCBvbiB3aGljaCBwYXJhbWV0ZXJzIHNob3VsZCBiZSBhZGRlZCAvIHVwZGF0ZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBwYXJhbWV0ZXJzIChuYW1lL3ZhbHVlKVxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gLSByZXN1bHRpbmcgdXJsXG4gKi9cbkhlbHBlcnMudXBkYXRlVXJsID0gZnVuY3Rpb24odXJsLCBwYXJhbXMpIHtcbiAgICBsZXQgdXJsUGFydHMgPSB1cmwuc3BsaXQoJz8nKTtcbiAgICBsZXQgdG1wUGFyYW1zID0gW107XG4gICAgbGV0IG9yaWdpbmFsUGFyYW1zID0gW107XG4gICAgbGV0IG5ld1BhcmFtcyA9IFtdO1xuICAgIGxldCBiYXNlVXJsID0gJyc7XG4gICAgbGV0IHByb3BlcnR5ID0gJyc7XG4gICAgbGV0IHVwZGF0ZWQgPSBmYWxzZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IGogPSAwO1xuXG4gICAgZm9yIChwcm9wZXJ0eSBpbiBwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtcy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgIHRtcFBhcmFtcy5wdXNoKFtwcm9wZXJ0eSwgJz0nLCBwYXJhbXNbcHJvcGVydHldXS5qb2luKCcnKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBiYXNlVXJsID0gdXJsUGFydHNbMF07XG4gICAgb3JpZ2luYWxQYXJhbXMgPSB1cmxQYXJ0cy5sZW5ndGggPiAxID8gdXJsUGFydHNbMV0uc3BsaXQoJyYnKSA6IFtdO1xuXG4gICAgZm9yIChpOyBpIDwgdG1wUGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHVwZGF0ZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgb3JpZ2luYWxQYXJhbXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICh0bXBQYXJhbXNbaV0gJiYgb3JpZ2luYWxQYXJhbXNbal0uc3BsaXQoJz0nKVswXSA9PT0gdG1wUGFyYW1zW2ldLnNwbGl0KCc9JylbMF0pIHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFBhcmFtc1tqXSA9IHRtcFBhcmFtc1tpXTtcbiAgICAgICAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXBkYXRlZCkge1xuICAgICAgICAgICAgbmV3UGFyYW1zLnB1c2godG1wUGFyYW1zW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoW2Jhc2VVcmwsICc/Jywgb3JpZ2luYWxQYXJhbXMuY29uY2F0KG5ld1BhcmFtcykuam9pbignJicpXS5qb2luKCcnKSk7XG59O1xuXG5cbi8qKlxuICogR2V0IHZhbHVlIG9mIHBhcmFtZXRlciBmb3IgZ2l2ZW4gdXJsXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybCAtIGdpdmVuIHVybFxuICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtIC0gcGFyYW1ldGVyIChuYW1lKVxuICpcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSAtIHZhbHVlIG9mIHBhcmFtZXRlclxuICovXG5IZWxwZXJzLmdldFBhcmFtRnJvbVVybCA9IGZ1bmN0aW9uKHVybCwgcGFyYW0pIHtcbiAgICBsZXQgdXJsUGFydHMgPSB1cmwuc3BsaXQoJz8nKTtcbiAgICBsZXQgb3JpZ2luYWxQYXJhbXMgPSB1cmxQYXJ0cy5sZW5ndGggPiAxID8gdXJsUGFydHNbMV0uc3BsaXQoJyYnKSA6IFtdO1xuICAgIGxldCBpID0gMDtcblxuICAgIGZvciAoaTsgaSA8IG9yaWdpbmFsUGFyYW1zLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgaWYgKG9yaWdpbmFsUGFyYW1zW2ldLmluZGV4T2YocGFyYW0pID09PSAwKSB7XG4gICAgICAgICAgICBsZXQga2V5VmFsID0gb3JpZ2luYWxQYXJhbXNbaV0uc3BsaXQoJz0nKTtcblxuICAgICAgICAgICAgcmV0dXJuIGtleVZhbC5sZW5ndGggPiAxID8ga2V5VmFsWzFdIDogdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblxuLyoqXG4gKiBHZW5lcmF0ZXMgbnVtZXJpYyBpZC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3NlZ21lbnRzPTFdIC0gbnVtYmVyIG9mIHNlZ21lbnRzIG9mIGdlbmVyYXRlZCBpZCAoc2VnbWVudHMgY29uc2lzdCBvZiAxMCBkaWdpdHMsIHNlcGFyYXRlZCBieSAnLScpLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gLSBnZW5lcmF0ZWQgaWRcbiAqL1xuSGVscGVycy5tYWtlSWQgPSBmdW5jdGlvbihzZWdtZW50cyA9IDEpIHtcbiAgICBsZXQgYXJyYXkgPSB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDMyQXJyYXkoc2VnbWVudHMpKTtcbiAgICBsZXQgaWQgPSAnJztcbiAgICBsZXQgaSA9IDA7XG5cbiAgICBmb3IgKDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlkICs9IGFycmF5W2ldICsgJy0nO1xuICAgIH1cblxuICAgIHJldHVybiBpZC5zbGljZSgwLCAtMSk7XG59O1xuXG5cbi8qKlxuICogRGV0ZWN0IHN3aXBlIGdlc3R1cmVzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsIC0gZWxlbWVudCB0byBkZXRlY3Qgc3dpcGVzIG9uXG4gKiBAcGFyYW0ge051bWJlcn0gdGhyZXNob2xkIC0gdGhyZXNob2xkIGZvciBzd2lwZSAoaW4gcHgpXG4gKi9cbkhlbHBlcnMuZGV0ZWN0U3dpcGUgPSBmdW5jdGlvbihlbCwgdGhyZXNob2xkKSB7XG4gICAgbGV0IHRvdWNoc3RhcnRYID0gMDtcbiAgICBsZXQgdG91Y2hzdGFydFkgPSAwO1xuICAgIGxldCB0b3VjaGVuZFggPSAwO1xuICAgIGxldCB0b3VjaGVuZFkgPSAwO1xuICAgIGxldCBzd2lwZVRocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAwO1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlU3dpcGUoKSB7XG4gICAgICAgIGxldCBkZWx0YVggPSBNYXRoLmFicyh0b3VjaHN0YXJ0WCAtIHRvdWNoZW5kWCk7XG4gICAgICAgIGxldCBkZWx0YVkgPSBNYXRoLmFicyh0b3VjaHN0YXJ0WSAtIHRvdWNoZW5kWSk7XG5cbiAgICAgICAgaWYgKGRlbHRhWCA+IHN3aXBlVGhyZXNob2xkKSB7XG4gICAgICAgICAgICBpZiAodG91Y2hlbmRYIDwgdG91Y2hzdGFydFgpIHtcbiAgICAgICAgICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnc3dpcGUnLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAnbGVmdCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRvdWNoZW5kWCA+IHRvdWNoc3RhcnRYKSB7XG4gICAgICAgICAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3N3aXBlJywge1xuICAgICAgICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ3JpZ2h0J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlbHRhWSA+IHN3aXBlVGhyZXNob2xkKSB7XG4gICAgICAgICAgICBpZiAodG91Y2hlbmRZIDwgdG91Y2hzdGFydFkpIHtcbiAgICAgICAgICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnc3dpcGUnLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAndXAnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0b3VjaGVuZFkgPiB0b3VjaHN0YXJ0WSkge1xuICAgICAgICAgICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdzd2lwZScsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246ICdkb3duJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdG91Y2hzdGFydFggPSBlLnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgdG91Y2hzdGFydFkgPSBlLnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdG91Y2hlbmRYID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICB0b3VjaGVuZFkgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFk7XG5cbiAgICAgICAgaGFuZGxlU3dpcGUoKTtcblxuICAgIH0sIGZhbHNlKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEhlbHBlcnM7IiwiLy8gUG9seWZpbGwgZm9yIGN1c3RvbSBldmVudHNcbihmdW5jdGlvbiAoKSB7XG5cdGlmICh0eXBlb2Ygd2luZG93LkN1c3RvbUV2ZW50ID09PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cblx0ZnVuY3Rpb24gQ3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcykge1xuXHRcdHBhcmFtcyA9IHBhcmFtcyB8fCB7YnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IGZhbHNlLCBkZXRhaWw6IHVuZGVmaW5lZH07XG5cdFx0dmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuXHRcdGV2dC5pbml0Q3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG5cdFx0cmV0dXJuIGV2dDtcblx0fVxuXG5cdEN1c3RvbUV2ZW50LnByb3RvdHlwZSA9IHdpbmRvdy5FdmVudC5wcm90b3R5cGU7XG5cblx0d2luZG93LkN1c3RvbUV2ZW50ID0gQ3VzdG9tRXZlbnQ7XG59KSgpOyJdfQ==
