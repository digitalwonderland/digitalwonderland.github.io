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
    // 'use strict';

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

// nav toggle

$('#toggle').click(function () {
    $(this).toggleClass('active');
    $('#overlay').toggleClass('open');
});

$(document).ready(function () {
    $('.bars').click(function () {
        $('#nav').toggleClass('open');
        $('.container').toggleClass('menu-open');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXNvdXJjZXMvanMvYXBwLmpzIiwicmVzb3VyY2VzL2pzL21haW4uanMiLCJyZXNvdXJjZXMvanMvdXRpbHMvZXZlbnRzLmpzIiwicmVzb3VyY2VzL2pzL3V0aWxzL2hlbHBlcnMuanMiLCJyZXNvdXJjZXMvanMvdXRpbHMvcG9seWZpbGxzL2N1c3RvbS1ldmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7Ozs7OztBQUVBOzs7O0FBRUE7Ozs7OztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sY0FBYyxRQUFRLGFBQVIsQ0FBcEI7O0FBRUEsUUFBUSxXQUFSOztrQkFFZ0IsWUFBVztBQUN2Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFJLE9BQU8sTUFBWDtBQUNBLFNBQUssUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUssUUFBTCxDQUFjLENBQWQsR0FBa0IsQ0FBbEI7O0FBRUE7QUFDQSxRQUFJLE1BQU0sS0FBSyxHQUFMLEdBQVcsa0JBQVEsTUFBUixDQUFlLE9BQU8sR0FBUCxJQUFjLEVBQTdCLEVBQWlDO0FBQ2xELGNBQU0sa0JBQVEsTUFBUixDQUFlLEVBQWYsRUFBbUIsWUFBWSxNQUEvQjtBQUQ0QyxLQUFqQyxDQUFyQjs7QUFJQTtBQUNBLFFBQUksV0FBSixHQUFrQixXQUFsQjtBQUNBLFFBQUksQ0FBSixHQUFRLENBQVI7QUFDQSxRQUFJLE1BQUo7O0FBRUE7Ozs7O0FBS0EsUUFBSSxhQUFKLEdBQW9CLFVBQVMsT0FBVCxFQUFrQjtBQUNsQyxvQkFBWSxJQUFaLENBQWlCLElBQWpCLENBQXNCLElBQXRCLEVBQTRCLE9BQTVCO0FBQ0gsS0FGRDtBQUdBLFFBQUksY0FBSixHQUFxQixVQUFTLE9BQVQsRUFBa0I7QUFDbkMsb0JBQVksS0FBWixDQUFrQixJQUFsQixDQUF1QixJQUF2QixFQUE2QixPQUE3QjtB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QUFQO0FBQ0E7O0FBRUQsYUFBWSxTQUFaLEdBQXdCLE9BQU8sS0FBUCxDQUFhLFNBQXJDOztBQUVBLFFBQU8sV0FBUCxHQUFxQixXQUFyQjtBQUNBLENBYkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgSGVscGVycyBmcm9tICcuL3V0aWxzL2hlbHBlcnMnO1xuXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4vdXRpbHMvZXZlbnRzJztcblxuY29uc3QgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuY29uc3QgRXhvc2tlbGV0b24gPSByZXF1aXJlKCdleG9za2VsZXRvbicpO1xuXG5yZXF1aXJlKCdyZXNwaW1hZ2UnKTtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uKCkge1xuICAgIC8vICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBHTE9CQUwgTkFNRVNQQUNFXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gU2F2ZSBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdFxuICAgIGxldCByb290ID0gd2luZG93O1xuICAgIHJvb3QuQmFja2JvbmUgPSB7fTtcbiAgICByb290LkJhY2tib25lLiQgPSAkO1xuXG4gICAgLy8gQGJvcnJvdyBvYmplY3RzXG4gICAgbGV0IEFwcCA9IHJvb3QuQXBwID0gSGVscGVycy5leHRlbmQod2luZG93LkFwcCB8fCB7fSwge1xuICAgICAgICBWZW50OiBIZWxwZXJzLmV4dGVuZCh7fSwgRXhvc2tlbGV0b24uRXZlbnRzKVxuICAgIH0pO1xuXG4gICAgLy8gQWRkIGdsb2JhbHNcbiAgICBBcHAuRXhvc2tlbGV0b24gPSBFeG9za2VsZXRvbjtcbiAgICBBcHAuJCA9ICQ7XG4gICAgQXBwLkVWRU5UUyA9IEVWRU5UUztcblxuICAgIC8qKlxuICAgICogQ3JlYXRlIGN1c3RvbSB2aWV3IHdpdGggb3duIHByb3BlcnRpZXMgYW5kXG4gICAgKiB0YWtlIHRoaXMgdmlldyBpbiBvdXIgbW9kdWxlc1xuICAgICogcmVnaXN0ZXIgb25seSBvbmUgcmVmZXJlbmNlIHRvIG91ciBnbG9iYWwgbGlicmFyeSBFeG9za2VsZXRvblxuICAgICovXG4gICAgQXBwLkNvbXBvbmVudFZpZXcgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIEV4b3NrZWxldG9uLlZpZXcuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB9O1xuICAgIEFwcC5Db21wb25lbnRNb2RlbCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgRXhvc2tlbGV0b24uTW9kZWwuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB9O1xuICAgIEFwcC5Db21wb25lbnRDb2xsZWN0aW9uID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBFeG9za2VsZXRvbi5Db2xsZWN0aW9uLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIEhlbHBlcnMuZXh0ZW5kKEFwcC5Db21wb25lbnRWaWV3LnByb3RvdHlwZSwgRXhvc2tlbGV0b24uVmlldy5wcm90b3R5cGUsIHt9KTtcbiAgICBIZWxwZXJzLmV4dGVuZChBcHAuQ29tcG9uZW50TW9kZWwucHJvdG90eXBlLCBFeG9za2VsZXRvbi5Nb2RlbC5wcm90b3R5cGUsIHt9KTtcbiAgICBIZWxwZXJzLmV4dGVuZChBcHAuQ29tcG9uZW50Q29sbGVjdGlvbi5wcm90b3R5cGUsIEV4b3NrZWxldG9uLkNvbGxlY3Rpb24ucHJvdG90eXBlLCB7fSk7XG5cbiAgICBBcHAuQ29tcG9uZW50Vmlldy5leHRlbmQgPSBFeG9za2VsZXRvbi5WaWV3LmV4dGVuZDtcbiAgICBBcHAuQ29tcG9uZW50TW9kZWwuZXh0ZW5kID0gRXhvc2tlbGV0b24uTW9kZWwuZXh0ZW5kO1xuICAgIEFwcC5Db21wb25lbnRDb2xsZWN0aW9uLmV4dGVuZCA9IEV4b3NrZWxldG9uLkNvbGxlY3Rpb24uZXh0ZW5kO1xuXG4gICAgLyoqXG4gICAgKiBBZGQgb3VyIE1peGluIHRvIG91ciBWaWV3IG9iamVjdC5cbiAgICAqL1xuICAgIEFwcC5Db21wb25lbnRWaWV3LmNsYXNzTWl4aW4gPSBIZWxwZXJzLmNsYXNzTWl4aW47XG5cbiAgICAvLyBGZWF0dXJlIGRldGVjdGlvblxuICAgIEFwcC5zdXBwb3J0ID0gQXBwLnN1cHBvcnQgfHwge307XG4gICAgQXBwLnN1cHBvcnQudG91Y2ggPSBIZWxwZXJzLmlzVG91Y2goKTtcbiAgICBBcHAuY2xpY2tIYW5kbGVyID0gSGVscGVycy5jbGlja0hhbmRsZXIoKTtcblxuICAgIC8vIFZlcnNpb25pbmdcbiAgICBBcHAudmVyc2lvbiA9IFwiMC4wLjFcIjtcblxuICAgIC8vIEdsb2JhbCBtb2R1bGUgcmVnaXN0cnlcbiAgICBBcHAubW9kdWxlcyA9IHt9O1xuXG4gICAgLy8gQWRkIG1vZHVsZSB0byBnbG9iYWwgcmVnaXN0cnlcbiAgICBBcHAucmVnaXN0ZXJNb2R1bGUgPSBmdW5jdGlvbihtb2R1bGUsIGVsKSB7XG4gICAgICAgIGlmICghQXBwLm1vZHVsZXNbbW9kdWxlLm5hbWVdKSB7XG4gICAgICAgICAgICBBcHAubW9kdWxlc1ttb2R1bGUubmFtZV0gPSBtb2R1bGU7XG4gICAgICAgICAgICBBcHAubW9kdWxlc1ttb2R1bGUubmFtZV0ubm9kZXMgPSBbZWxdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQXBwLm1vZHVsZXNbbW9kdWxlLm5hbWVdLm5vZGVzLnB1c2goZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgQXBwLlZlbnQudHJpZ2dlcihBcHAuRVZFTlRTLm1vZHVsZVJlZ2lzdGVyZWQsIHtcbiAgICAgICAgICAgIG1vZHVsZTogbW9kdWxlLFxuICAgICAgICAgICAgZWw6IGVsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBNZWRpYSBRdWVyeVxuICAgIGxldCBoZWFkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaGVhZCcpO1xuICAgIEFwcC5jdXJyZW50TWVkaWEgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShoZWFkWzBdLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LWZhbWlseScpO1xuXG4gICAgLy8gU2NyZWVuIFNpemVcbiAgICBBcHAuc2NyZWVuU2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IHJvb3QuaW5uZXJXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiByb290LmlubmVySGVpZ2h0XG4gICAgfTtcblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBDSEVDS0lOR1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAgaWYgKGRvY3VtZW50LmxvY2F0aW9uLnNlYXJjaC5pbmRleE9mKCdkZXZtb2RlJykgPiAtMSkge1xuICAgICAgICBBcHAuZGV2bW9kZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGRvY3VtZW50LmxvY2F0aW9uLnNlYXJjaC5pbmRleE9mKCdsb2dnZXInKSA+IC0xKSB7XG4gICAgICAgIEFwcC5sb2dnZXIgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGhpZGUgYWxsIHdhcm5pbmdzIGFuZCBsb2dzIGlmIG5vdCBpbiBkZXZtb2RlXG4gICAgaWYgKCFBcHAuZGV2bW9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZyA9IGNvbnNvbGUud2FybiA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuXG4gICAgLy8gYWRkIGNvbnNvbGUgb3V0cHV0IGVsZW1lbnQgKHRyaWdnZXJlZCBieSBwYXJhbWV0ZXIgJ2Rldm1vZGUnIGFuZCAnbG9nZ2VyJyBpbiB1cmwpXG4gICAgaWYgKEFwcC5kZXZtb2RlICYmIEFwcC5sb2dnZXIpIHtcbiAgICAgICAgbGV0IGxvZ2dlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuXG4gICAgICAgIGxvZ2dlci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2xvZ2dlcicpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvZ2dlcik7XG5cbiAgICAgICAgY29uc29sZS53cml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1tpXSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5uZXJIVE1MICs9IChKU09OICYmIEpTT04uc3RyaW5naWZ5ID8gSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzW2ldLCB1bmRlZmluZWQsIDIpIDogYXJndW1lbnRzW2ldKSArICc8YnIgLz4nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbm5lckhUTUwgKz0gYXJndW1lbnRzW2ldICsgJzxiciAvPic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2dnZXIuaW5uZXJIVE1MICs9ICc8YnIgLz4nO1xuICAgICAgICAgICAgbG9nZ2VyLnNjcm9sbFRvcCA9IGxvZ2dlci5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9nZ2VyLmlubmVySFRNTCArPSAnW0Vycm9yXTxiciAvPic7XG4gICAgICAgICAgICBjb25zb2xlLndyaXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS53YXJuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5uZXJIVE1MICs9ICdbV2Fybl08YnIgLz4nO1xuICAgICAgICAgICAgY29uc29sZS53cml0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5uZXJIVE1MICs9ICdbTG9nXTxiciAvPic7XG4gICAgICAgICAgICBjb25zb2xlLndyaXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gR0xPQkFMIEVWRU5UU1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8qKlxuICAgICogVHJpZ2dlcnNcbiAgICAqL1xuXG4gICAgLy8gVHJpZ2dlciBnbG9iYWwgcmVzaXplIGV2ZW50XG4gICAgd2luZG93Lm9ucmVzaXplID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBsZXQgY3VycmVudE1lZGlhID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoaGVhZFswXSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgnZm9udC1mYW1pbHknKTtcbiAgICAgICAgbGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRNZWRpYSAhPT0gQXBwLmN1cnJlbnRNZWRpYSkge1xuICAgICAgICAgICAgbGV0IG9sZE1lZGlhID0gQXBwLmN1cnJlbnRNZWRpYTtcblxuICAgICAgICAgICAgQXBwLmN1cnJlbnRNZWRpYSA9IGN1cnJlbnRNZWRpYTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBcHAuY3VycmVudE1lZGlhOiAnLCBBcHAuY3VycmVudE1lZGlhKTtcblxuICAgICAgICAgICAgQXBwLlZlbnQudHJpZ2dlcihBcHAuRVZFTlRTLm1lZGlhY2hhbmdlLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogQXBwLkVWRU5UUy5tZWRpYWNoYW5nZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50TWVkaWE6IGN1cnJlbnRNZWRpYSxcbiAgICAgICAgICAgICAgICBvbGRNZWRpYTogb2xkTWVkaWFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpZHRoICE9IEFwcC5zY3JlZW5TaXplLndpZHRoKSB7XG4gICAgICAgICAgICBBcHAuc2NyZWVuU2l6ZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgQXBwLlZlbnQudHJpZ2dlcihBcHAuRVZFTlRTLnJlc2l6ZSwgZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZG9jdW1lbnQub25zY3JvbGwgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIEFwcC5WZW50LnRyaWdnZXIoQXBwLkVWRU5UUy5zY3JvbGwsIGUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gQXBwO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiLy8gTWFpbiBSZXF1aXJlbWVudHNcbmltcG9ydCBBcHAgZnJvbSAnLi9hcHAnO1xuaW1wb3J0IEhlbHBlcnMgZnJvbSAnLi91dGlscy9oZWxwZXJzJztcblxuLy8gRVM2IE1vZHVsZXNcblxuLy8gQElOU0VSVFBPSU5UIDo6IEByZWY6IGpzLWltcG9ydFxuXG4vLyBWYXJzXG5jb25zdCAkID0gQXBwLiQ7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTWFpbiBGdW5jdGlvbmFsaXR5XG5jbGFzcyBDb3JlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBvdXIgY29yZSBmdW5jdGlvbmFsaXR5XG4gICAgICogVGhpcyBmdW5jdGlvbiB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb25jZS5cbiAgICAgKi9cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQXBwIGluaXRpYWxpemVkIHdpdGggdmVyc2lvbjogJywgQXBwLnZlcnNpb24pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXRlY3QgVG91Y2hcbiAgICAgICAgICovXG4gICAgICAgIGlmICghQXBwLnN1cHBvcnQudG91Y2gpIHtcbiAgICAgICAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnbm8tdG91Y2gnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygndG91Y2gnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlZGlyZWN0XG4gICAgICAgIEFwcC5WZW50Lm9uKEFwcC5FVkVOVFMuRE9NcmVkaXJlY3QsIChvYmopID0+IHtcbiAgICAgICAgICAgIGlmICghb2JqICYmICFvYmoudXJsKSB0aHJvdyBuZXcgRXJyb3IoJ09iamVjdCBpcyBub3QgZGVmaW5lZC4gUGxlYXNlIHByb3ZpZGUgYW4gdXJsIGluIHlvdXIgb2JqZWN0IScpO1xuXG4gICAgICAgICAgICAvLyBSZWRpcmVjdCB0byBwYWdlXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFN0cmluZyhvYmoudXJsKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQElOU0VSVFBPSU5UIDo6IEByZWY6IGpzLWluaXQtb25jZS12M1xuXG4gICAgfVxuXG4gICAgcHJlUmVuZGVyKCkge1xuICAgICAgICBIZWxwZXJzLnNhdmVET00oKTtcbiAgICB9XG5cbiAgICByZW5kZXIoY29udGV4dCkge1xuICAgICAgICAvLyBASU5TRVJUUE9JTlQgOjogQHJlZjoganMtaW5pdC12M1xuXG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbigpIHtcbiAgICBsZXQgY29yZSA9IG5ldyBDb3JlKCk7XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgbW9kdWxlc1xuICAgICAqL1xuICAgIGNvcmUucHJlUmVuZGVyKCk7XG4gICAgY29yZS5yZW5kZXIoZG9jdW1lbnQpO1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBtb2R1bGVzIHdoaWNoIGFyZSBsb2FkZWQgYWZ0ZXIgaW5pdGlhbCBsb2FkXG4gICAgICogdmlhIGN1c3RvbSBldmVudCAnRE9NY2hhbmdlZCdcbiAgICAgKi9cbiAgICBBcHAuVmVudC5vbihBcHAuRVZFTlRTLkRPTWNoYW5nZWQsIChjb250ZXh0KSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEb20gaGFzIGNoYW5nZWQuIEluaXRpYWxpc2luZyBuZXcgbW9kdWxlcyBpbjogJywgY29udGV4dCk7XG4gICAgICAgIGNvcmUucHJlUmVuZGVyKCk7XG4gICAgICAgIGNvcmUucmVuZGVyKGNvbnRleHQpO1xuICAgIH0pO1xufSk7XG5cblxuLy8gbmF2IHRvZ2dsZVxuXG4kKCcjdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJyk7XG4gICAgJCgnI292ZXJsYXknKS50b2dnbGVDbGFzcygnb3BlbicpO1xufSk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICQoJy5iYXJzJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJyNuYXYnKS50b2dnbGVDbGFzcygnb3BlbicpO1xuICAgICAgICAkKCcuY29udGFpbmVyJykudG9nZ2xlQ2xhc3MoJ21lbnUtb3BlbicpO1xuICAgIH0pO1xufSk7IiwiLyoqXG4gKiBDb25zdCBmb3IgZXZlbnRzIChwdWIvc3ViKVxuICpcbiAqIEBhdXRob3I6IFNlYmFzdGlhbiBGaXR6bmVyXG4gKi9cblxuLyoqXG4gKiBFdmVudHMgR2xvYmFsXG4gKi9cblxuY29uc3QgRVZFTlRTID0ge1xuXHRibHVyOiAnYmx1cicsXG5cdGNoYW5nZTogJ2NoYW5nZScsXG5cdGNsaWNrOiAnY2xpY2snLFxuXHRkYmxjbGljazogJ2RibGNsaWNrJyxcblx0RE9NY2hhbmdlZDogJ0RPTWNoYW5nZWQnLFxuXHRET01yZWRpcmVjdDogJ2RvbTpyZWRpcmVjdCcsXG5cdGhhc2hjaGFuZ2U6ICdoYXNoY2hhbmdlJyxcblx0aW5wdXQ6ICdpbnB1dCcsXG5cdGtleWRvd246ICdrZXlkb3duJyxcblx0a2V5cHJlc3M6ICdrZXlwcmVzcycsXG5cdGtleXVwOiAna2V5dXAnLFxuXHRtZWRpYWNoYW5nZTogJ21lZGlhY2hhbmdlJyxcblx0bW9kdWxlUmVnaXN0ZXJlZDogJ21vZHVsZVJlZ2lzdGVyZWQnLFxuXHRtb3VzZWRvd246ICdtb3VzZWRvd24nLFxuXHRtb3VzZWVudGVyOiAnbW91c2VlbnRlcicsXG5cdG1vdXNlbGVhdmU6ICdtb3VzZWxlYXZlJyxcblx0bW91c2VvdXQ6ICdtb3VzZW91dCcsXG5cdG1vdXNlb3ZlcjogJ21vdXNlb3ZlcicsXG5cdG1vdXNldXA6ICdtb3VzZXVwJyxcblx0cmVzZXQ6ICdyZXNldCcsXG5cdHJlc2l6ZTogJ3Jlc2l6ZScsXG5cdHNjcm9sbDogJ3Njcm9sbCcsXG5cdHN1Ym1pdDogJ3N1Ym1pdCcsXG5cdHN3aXBlOiAnc3dpcGUnXG59O1xuXG4vLyBASU5TRVJUUE9JTlQgOjogQHJlZjoganMtZXZlbnRzXG5cbmV4cG9ydCBkZWZhdWx0IEVWRU5UUztcbiIsIi8qKlxuICogUmVwcmVzZW50cyBhIEhlbHBlciBPYmplY3QuXG4gKiBAbW9kdWxlIEhlbHBlclxuICpcbiAqIEBhdXRob3IgU2ViYXN0aWFuIEZpdHpuZXJcbiAqIEBhdXRob3IgQW5keSBHdXRzY2hlXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEltcG9ydHNcbiAqL1xuaW1wb3J0ICcuL3BvbHlmaWxscy9jdXN0b20tZXZlbnQnO1xuXG5cbi8vIEBhbGlhcyBtb2R1bGU6IEhlbHBlcnNcblxubGV0IEhlbHBlcnMgPSB7fTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTU9EVUxFIEhFTFBFUlNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTYXZlL1VwZGF0ZSBET00gcmVmZXJlbmNlcyBmb3IgSlMgTW9kdWxlc1xuICpcbiAqXG4gKi9cbkhlbHBlcnMuc2F2ZURPTSA9IGZ1bmN0aW9uKCkge1xuICAgIEhlbHBlcnMuZGF0YUpzTW9kdWxlcyA9IEhlbHBlcnMucXVlcnlTZWxlY3RvckFycmF5KCdbZGF0YS1qcy1tb2R1bGVdJyk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBtb2R1bGUgYW5kIHJlbmRlciBpdCBhbmQvb3IgcHJvdmlkZSBhIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiAtIERlZmluaXRpb24gb2Ygb3VyIG1vZHVsZVxuICogQHBhcmFtIHtzdHJpbmd9IG9iai5lbCAtIFJlcXVpcmVkOiBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqLk1vZHVsZSAtIFJlcXVpcmVkOiBjbGFzcyB3aGljaCB3aWxsIGJlIHVzZWQgdG8gcmVuZGVyIHlvdXIgbW9kdWxlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvYmoucmVuZGVyPXRydWVdIC0gT3B0aW9uYWw6IHJlbmRlciB0aGUgY2xhc3MsIGlmIGZhbHNlIHRoZSBjbGFzcyB3aWxsIG9ubHkgYmUgaW5pdGlhbGl6ZWRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IFtvYmouY2JdIC0gT3B0aW9uYWw6IHByb3ZpZGUgYSBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGV4ZWN1dGVkIGFmdGVyIGluaXRpYWxpc2F0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gW29iai5jb250ZXh0XSAtIE9wdGlvbmFsOiBjb250ZXh0IG9mIG1vZHVsZVxuICpcbiAqL1xuSGVscGVycy5sb2FkTW9kdWxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmouZG9tTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdJbiBvcmRlciB0byB3b3JrIHdpdGggbG9hZE1vZHVsZSB5b3UgbmVlZCB0byBkZWZpbmUgdGhlIG1vZHVsZSBuYW1lIChkZWZpbmVkIGluIGRhdGEtanMtbW9kdWxlIGF0dHJpYnV0ZSkgYXMgc3RyaW5nISAnKTtcbiAgICBpZiAoIW9iai5tb2R1bGUpIHRocm93IG5ldyBFcnJvcignSW4gb3JkZXIgdG8gd29yayB3aXRoIGxvYWRNb2R1bGUgeW91IG5lZWQgdG8gZGVmaW5lIGEgTW9kdWxlIScpO1xuXG4gICAgbGV0IGNvbnRleHQgPSBvYmouY29udGV4dCB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XG4gICAgbGV0IHJlbmRlck9uSW5pdCA9IG9iai5yZW5kZXIgIT09IGZhbHNlO1xuXG5cbiAgICBIZWxwZXJzLmZvckVhY2goSGVscGVycy5kYXRhSnNNb2R1bGVzLCAoaSwgZWwpID0+IHtcbiAgICAgICAgbGV0IGRhdGFNb2R1bGVzID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWpzLW1vZHVsZScpLnNwbGl0KCcgJyk7XG5cbiAgICAgICAgaWYgKGRhdGFNb2R1bGVzLmluZGV4T2Yob2JqLmRvbU5hbWUpICE9IC0xICYmIEhlbHBlcnMuY2hlY2tFbGVtZW50SW5Db250ZXh0KGVsLCBjb250ZXh0KSkge1xuICAgICAgICAgICAgbGV0IGF0dHJzID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWpzLW9wdGlvbnMnKTtcbiAgICAgICAgICAgIGxldCBvcHRpb25zID0gSlNPTi5wYXJzZShhdHRycyk7XG4gICAgICAgICAgICBsZXQgbW9kdWxlID0gbmV3IG9iai5tb2R1bGUoe1xuICAgICAgICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gUmVuZGVyIGFmdGVyIGluaXRpYWwgbW9kdWxlIGxvYWRpbmdcbiAgICAgICAgICAgIGlmIChyZW5kZXJPbkluaXQpIG1vZHVsZS5yZW5kZXIoKTtcbiAgICAgICAgICAgIC8vIFByb3ZpZGUgY2FsbGJhY2sgZnVuY3Rpb24gaW4gd2hpY2ggeW91IGNhbiB1c2UgbW9kdWxlIGFuZCBvcHRpb25zXG4gICAgICAgICAgICBpZiAob2JqLmNiICYmIHR5cGVvZihvYmouY2IpID09PSBcImZ1bmN0aW9uXCIpIG9iai5jYihtb2R1bGUsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFWFRFTkRJTkcgSEVMUEVSU1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNpbXBsZSBleHRlbmQgbWV0aG9kIHRvIGV4dGVuZCB0aGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiAtIG9iamVjdCB3aGljaCB3aWxsIGJlIGV4dGVuZGVkXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBvYmogLSBleHRlbmRlZCBvYmplY3RcbiAqL1xuSGVscGVycy5leHRlbmQgPSBmdW5jdGlvbiBleHRlbmQob2JqKSB7XG4gICAgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGl0ZW0pIG9ialtrZXldID0gaXRlbVtrZXldO1xuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG59O1xuXG4vKipcbiAqIFNpbXBsZSBleHRlbmQgbWV0aG9kLCB3aGljaCBleHRlbmRzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIC0gb2JqZWN0IHdoaWNoIHdpbGwgYmUgZXh0ZW5kZWRcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IG9iaiAtIGV4dGVuZGVkIG9iamVjdFxuICovXG5IZWxwZXJzLmRlZmF1bHRzID0gZnVuY3Rpb24gZGVmYXVsdHMob2JqKSB7XG4gICAgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGl0ZW0pIHtcbiAgICAgICAgICAgIGlmIChvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSBvYmpba2V5XSA9IGl0ZW1ba2V5XTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG59O1xuXG4vKipcbiAqIE1lcmdlIG1ldGhvZCBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGZyb20gLSBNaXhpbiBvYmplY3Qgd2hpY2ggd2lsbCBiZSBtZXJnZWQgdmlhIEhlbHBlcnMuZGVmYXVsdHMgd2l0aCB0aGUgbWV0aG9kcyBvZiBvdXIgY2xhc3NcbiAqIEBwYXJhbSB7QXJyYXl9IG1ldGhvZHMgLSBBcnJheSBvZiBtZXRob2QgbmFtZXMgd2hpY2ggd2lsbCBiZSBleHRlbmRlZC5cbiAqL1xuSGVscGVycy5jbGFzc01peGluID0gZnVuY3Rpb24oZnJvbSwgbWV0aG9kcyA9IFsnaW5pdGlhbGl6ZScsICdyZW5kZXInXSkge1xuXG4gICAgbGV0IHRvID0gdGhpcy5wcm90b3R5cGU7XG5cbiAgICAvKiogQWRkIHRob3NlIG1ldGhvZHMgd2hpY2ggZXhpc3RzIG9uIGBmcm9tYCBidXQgbm90IG9uIGB0b2AgdG8gdGhlIGxhdHRlciAqL1xuICAgIEhlbHBlcnMuZGVmYXVsdHModG8sIGZyb20pO1xuXG4gICAgLyoqIHdlIGRvIHRoZSBzYW1lIGZvciBldmVudHMgKi9cbiAgICBpZiAodG8uZXZlbnRzKSB7XG4gICAgICAgIEhlbHBlcnMuZGVmYXVsdHModG8uZXZlbnRzLCBmcm9tLmV2ZW50cyk7XG4gICAgfVxuXG4gICAgLy8gRXh0ZW5kIHRvJ3MgbWV0aG9kc1xuICAgIG1ldGhvZHMuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gICAgICAgIEhlbHBlcnMuZXh0ZW5kTWV0aG9kKHRvLCBmcm9tLCBtZXRob2QpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBIZWxwZXIgbWV0aG9kIHRvIGV4dGVuZCBhbiBhbHJlYWR5IGV4aXN0aW5nIG1ldGhvZC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdG8gLSB2aWV3IHdoaWNoIHdpbGwgYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBmcm9tIC0gbWV0aG9kcyB3aGljaCBjb21lcyBmcm9tIG1peGluXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZSAtIGZ1bmN0aW9uIG5hbWVcbiAqL1xuSGVscGVycy5leHRlbmRNZXRob2QgPSBmdW5jdGlvbih0bywgZnJvbSwgbWV0aG9kTmFtZSkge1xuICAgIGZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlIG1ldGhvZCBpcyBkZWZpbmVkIG9uIGZyb20gLi4uXG4gICAgaWYgKCFpc1VuZGVmaW5lZChmcm9tW21ldGhvZE5hbWVdKSkge1xuICAgICAgICBsZXQgb2xkID0gdG9bbWV0aG9kTmFtZV07XG5cbiAgICAgICAgLy8gLi4uIHdlIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvbiB0b1xuICAgICAgICB0b1ttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyB3aGVyZWluIHdlIGZpcnN0IGNhbGwgdGhlIG1ldGhvZCB3aGljaCBleGlzdHMgb24gYHRvYFxuICAgICAgICAgICAgbGV0IG9sZFJldHVybiA9IG9sZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAvLyBhbmQgdGhlbiBjYWxsIHRoZSBtZXRob2Qgb24gYGZyb21gXG4gICAgICAgICAgICBmcm9tW21ldGhvZE5hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIC8vIGFuZCB0aGVuIHJldHVybiB0aGUgZXhwZWN0ZWQgcmVzdWx0LFxuICAgICAgICAgICAgLy8gaS5lLiB3aGF0IHRoZSBtZXRob2Qgb24gYHRvYCByZXR1cm5zXG4gICAgICAgICAgICByZXR1cm4gb2xkUmV0dXJuO1xuICAgICAgICB9O1xuICAgIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZVTkNUSU9OQUwgSEVMUEVSU1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEdldCBkb20gZWxlbWVudHMgaW4gYW4gYXJyYXlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZWxlbSAtIFJlcXVpcmVkOiBzZWxlY3RvclxuICogQHBhcmFtIHtPYmplY3R9IFtjb250ZXh0XSAtIE9wdGlvbmFsOiBjb250ZXh0XG4gKlxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbkhlbHBlcnMucXVlcnlTZWxlY3RvckFycmF5ID0gSGVscGVycy4kID0gZnVuY3Rpb24oZWxlbSwgY29udGV4dCkge1xuICAgIGlmICghZWxlbSkgdGhyb3cgbmV3IEVycm9yKCdJbiBvcmRlciB0byB3b3JrIHdpdGggcXVlcnlTZWxlY3RvckFycmF5IHlvdSBuZWVkIHRvIGRlZmluZSBhbiBlbGVtZW50IGFzIHN0cmluZyEnKTtcbiAgICBsZXQgZWwgPSBlbGVtO1xuICAgIGxldCBjdXN0b21Db250ZXh0ID0gY29udGV4dCB8fCBkb2N1bWVudDtcblxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCgoY3VzdG9tQ29udGV4dCkucXVlcnlTZWxlY3RvckFsbChlbCkpO1xufTtcblxuLyoqXG4gKiBTaW1wbGUgZm9yRWFjaCBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSAtIGFycmF5IG9mIG9iamVjdHNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzY29wZSAtIHNjb3BlIG9mIGZ1bmN0aW9uXG4gKi9cbkhlbHBlcnMuZm9yRWFjaCA9IGZ1bmN0aW9uKGFycmF5LCBjYWxsYmFjaywgc2NvcGUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoc2NvcGUsIGksIGFycmF5W2ldKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZpbmQgaW5kZXggb2YgYSBzcGVjaWZpYyBpdGVtIGluIGFuIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IC0gYXJyYXkgaW4gd2hpY2ggd2Ugc2VhcmNoIGZvclxuICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gLSBpdGVtIHdoaWNoIHdpbGwgYmUgc2VhcmNoZWRcbiAqL1xuSGVscGVycy5pbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0pIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIGxldCBsO1xuICAgIGxldCBpO1xuXG4gICAgZm9yIChpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7IGkrKylcbiAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG59O1xuXG4vKipcbiAqIFJldHVybiBuZXcgUmVnRXhwXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlZ0V4IC0gUmVndWxhciBFeHByZXNzaW9uXG4gKlxuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5IZWxwZXJzLnJlZ0V4cCA9IGZ1bmN0aW9uKHJlZ0V4KSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXCIoXnxcXFxccyspXCIgKyByZWdFeCArIFwiKFxcXFxzK3wkKVwiKTtcbn07XG5cbi8qKlxuICogVGhyb3R0bGUgbWV0aG9kIGZvciByZXNpemUgZXZlbnRzIGFuZCBtb3JlXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgZXhlY3V0ZWQuXG4gKiBAcGFyYW0ge251bWJlcn0gd2FpdCAtIG51bWJlciB0byB3YWl0IGluIG1pbGxpc2Vjb25kcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW1tZWRpYXRlIC0gZXhlY3V0ZSBmdW5jdGlvbiBpbW1lZGlhdGVseS5cbiAqL1xuXG5IZWxwZXJzLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgbGV0IHRpbWVvdXQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBjb250ZXh0ID0gdGhpcztcbiAgICAgICAgbGV0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIGxldCBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgICBsZXQgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFpbW1lZGlhdGUpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcblxuICAgICAgICBpZiAoY2FsbE5vdykgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB9O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gREVURUNUSU9OIEhFTFBFUlNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUb3VjaCBEZXRlY3Rpb25cbiAqL1xuSGVscGVycy5pc1RvdWNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdztcbn07XG5cbi8qKlxuICogRGV0ZWN0IHRyYW5zaXRpb25lbmQgZXZlbnQuXG4gKi9cbkhlbHBlcnMudHJhbnNpdGlvbkVuZEV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHQ7XG4gICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmFrZWVsZW1lbnQnKTtcbiAgICBsZXQgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAnT1RyYW5zaXRpb24nOiAnb1RyYW5zaXRpb25FbmQnLFxuICAgICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCdcbiAgICB9O1xuXG4gICAgZm9yICh0IGluIHRyYW5zaXRpb25zKSB7XG4gICAgICAgIGlmIChlbC5zdHlsZVt0XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNpdGlvbnNbdF07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIERldGVjdCBhbmltYXRpb25lbmQgZXZlbnQuXG4gKi9cbkhlbHBlcnMuYW5pbWF0aW9uRW5kRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdDtcbiAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmYWtlZWxlbWVudCcpO1xuICAgIGxldCBhbmltYXRpb25zID0ge1xuICAgICAgICAnYW5pbWF0aW9uJzogJ2FuaW1hdGlvbmVuZCcsXG4gICAgICAgICdPQW5pbWF0aW9uJzogJ29BbmltYXRpb25FbmQnLFxuICAgICAgICAnTW96QW5pbWF0aW9uJzogJ2FuaW1hdGlvbmVuZCcsXG4gICAgICAgICdXZWJraXRBbmltYXRpb24nOiAnd2Via2l0QW5pbWF0aW9uRW5kJ1xuICAgIH07XG5cbiAgICBmb3IgKHQgaW4gYW5pbWF0aW9ucykge1xuICAgICAgICBpZiAoZWwuc3R5bGVbdF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbnNbdF07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIFJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lXG4gKlxuICogQHJldHVybiB7ZnVuY3Rpb259XG4gKi9cbkhlbHBlcnMucmVxdWVzdEFuaUZyYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcbiAgICAgICAgfTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENIRUNLIEhFTFBFUlNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vaW51eWFrc2EvanF1ZXJ5Lm5pY2VzY3JvbGwvYmxvYi9tYXN0ZXIvanF1ZXJ5Lm5pY2VzY3JvbGwuanNcbiAqXG4gKiBUb2RvOiBtZXJnZSB3aXRoIGNoZWNrRWxlbWVudEluQ29udGV4dFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuSGVscGVycy5oYXNQYXJlbnQgPSBmdW5jdGlvbihlLCBwKSB7XG4gICAgaWYgKCFlKSByZXR1cm4gZmFsc2U7XG4gICAgbGV0IGVsID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50IHx8IGUgfHwgZmFsc2U7XG4gICAgd2hpbGUgKGVsICYmIGVsICE9IHApIHtcbiAgICAgICAgZWwgPSBlbC5wYXJlbnROb2RlIHx8IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gKGVsICE9PSBmYWxzZSk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGVsZW1lbnQgaXMgaW4gYSBzcGVjaWZpYyBjb250ZXh0XG4gKiBhbmQgcmV0dXJuIHN0YXRlIGFzIGJvb2xlYW5cbiAqXG4gKiBUb2RvOiBtZXJnZSB3aXRoIGhhc1BhcmVudFxuICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBFbGVtZW50LCB3aGljaCB3aWxsIGJlIGNoZWNrZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IC0gQ29udGV4dCBlbGVtZW50LCBpbiB3aGljaCBvdXIgZWxlbWVudCBjb3VsZCBwZXJzaXN0c1xuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkhlbHBlcnMuY2hlY2tFbGVtZW50SW5Db250ZXh0ID0gZnVuY3Rpb24oZWxlbSwgY29udGV4dCkge1xuICAgIGxldCBjdXJyZW50Tm9kZSA9IGVsZW07XG4gICAgbGV0IGNvbnRleHROb2RlID0gY29udGV4dCB8fCBjb250ZXh0O1xuXG4gICAgd2hpbGUgKGN1cnJlbnROb2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnROb2RlO1xuXG4gICAgICAgIGlmIChIZWxwZXJzLmNoZWNrTm9kZUVxdWFsaXR5KGN1cnJlbnROb2RlLCBjb250ZXh0Tm9kZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBub2RlIGlzIHJlYWxseSB0aGUgc2FtZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIC0gT2JqZWN0LCB3aGljaCB3ZSB3YW50IHRvIGNoZWNrXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMiAtIEVsZW1lbnQsIHdoaWNoIHdlIHdhbnQgdG8gY2hlY2sgYWdhaW5zdCBlcXVhbGl0eVxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkhlbHBlcnMuY2hlY2tOb2RlRXF1YWxpdHkgPSBmdW5jdGlvbihvYmoxLCBvYmoyKSB7XG4gICAgcmV0dXJuIChvYmoxID09PSBvYmoyKTtcbn07XG5cblxuLyoqXG4gKiBDaGVjayBpZiBlbGVtZW50IGlzIGluIHZpZXdwb3J0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBPYmplY3QsIHdoaWNoIHdlIHdhbnQgdG8gY2hlY2tcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlQm91bmRzIC0gaWYgdHJ1ZSwgd2hvbGUgZWxlbWVudCBtdXN0IGJlIHZpc2libGVcbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5IZWxwZXJzLmlzSW5WaWV3cG9ydCA9IGZ1bmN0aW9uKGVsZW0sIHVzZUJvdW5kcykge1xuICAgIGxldCBlbCA9IGVsZW07XG4gICAgbGV0IHRvcCA9IGVsLm9mZnNldFRvcDtcbiAgICBsZXQgbGVmdCA9IGVsLm9mZnNldExlZnQ7XG4gICAgbGV0IHdpZHRoID0gZWwub2Zmc2V0V2lkdGg7XG4gICAgbGV0IGhlaWdodCA9IGVsLm9mZnNldEhlaWdodDtcbiAgICBsZXQgY29uZCA9IGZhbHNlO1xuXG4gICAgd2hpbGUgKGVsLm9mZnNldFBhcmVudCkge1xuICAgICAgICBlbCA9IGVsLm9mZnNldFBhcmVudDtcbiAgICAgICAgdG9wICs9IGVsLm9mZnNldFRvcDtcbiAgICAgICAgbGVmdCArPSBlbC5vZmZzZXRMZWZ0O1xuICAgIH1cblxuICAgIGlmICh1c2VCb3VuZHMpIHtcbiAgICAgICAgY29uZCA9IHRvcCA+PSB3aW5kb3cucGFnZVlPZmZzZXQgJiYgbGVmdCA+PSB3aW5kb3cucGFnZVhPZmZzZXQgJiYgKHRvcCArIGhlaWdodCkgPD0gKHdpbmRvdy5wYWdlWU9mZnNldCArIHdpbmRvdy5pbm5lckhlaWdodCkgJiYgKGxlZnQgKyB3aWR0aCkgPD0gKHdpbmRvdy5wYWdlWE9mZnNldCArIHdpbmRvdy5pbm5lcldpZHRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25kID0gdG9wIDwgKHdpbmRvdy5wYWdlWU9mZnNldCArIHdpbmRvdy5pbm5lckhlaWdodCkgJiYgbGVmdCA8ICh3aW5kb3cucGFnZVhPZmZzZXQgKyB3aW5kb3cuaW5uZXJXaWR0aCkgJiYgKHRvcCArIGhlaWdodCkgPiB3aW5kb3cucGFnZVlPZmZzZXQgJiYgKGxlZnQgKyB3aWR0aCkgPiB3aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmQ7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMQVlPVVQgSEVMUEVSU1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIG91dGVyIGhlaWdodCBmb3IgdGhlIGdpdmVuIERPTSBlbGVtZW50LCBpbmNsdWRpbmcgdGhlXG4gKiBjb250cmlidXRpb25zIG9mIG1hcmdpbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIHRoZSBlbGVtZW50IG9mIHdoaWNoIHRvIGNhbGN1bGF0ZSB0aGUgb3V0ZXIgaGVpZ2h0XG4gKiBAcGFyYW0ge2Jvb2xlYW59IG91dGVyIC0gYWRkIHBhZGRpbmcgdG8gaGVpZ2h0IGNhbGN1bGF0aW9uXG4gKlxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5IZWxwZXJzLmdldE91dGVySGVpZ2h0ID0gZnVuY3Rpb24oZWxlbSwgb3V0ZXIpIHtcbiAgICBsZXQgZWwgPSBlbGVtO1xuICAgIGxldCBoZWlnaHQgPSBlbC5vZmZzZXRIZWlnaHQ7XG5cbiAgICBpZiAob3V0ZXIpIHtcbiAgICAgICAgbGV0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG4gICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5wYWRkaW5nVG9wKSArIHBhcnNlSW50KHN0eWxlLnBhZGRpbmdCb3R0b20pO1xuICAgIH1cbiAgICByZXR1cm4gaGVpZ2h0O1xufTtcblxuLyoqXG4gKiBUZW1wbGF0aXplciBjbGVhbnMgdXAgdGVtcGxhdGUgdGFncyBhbmQgaW5zZXJ0IHRoZSBpbm5lciBodG1sIGJlZm9yZSB0aGUgdGFnXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiAtIENvbnRhaW5zIGFsbCBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge3N0cmluZ30gb2JqLnRlbXBsYXRlTmFtZSAtIERlZmluZXMgdGhlIHRlbXBsYXRlIG5hbWUgd2hpY2ggaXMgYSBzZWxlY3RvciBmcm9tIHRoZSBlbGVtZW50XG4gKi9cbkhlbHBlcnMudGVtcGxhdGl6ZXIgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoISdjb250ZW50JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpKSByZXR1cm47XG4gICAgaWYgKCFvYmogJiYgIW9iai50ZW1wbGF0ZU5hbWUpIHRocm93IG5ldyBFcnJvcignWW91IG5lZWQgdG8gcGFzcyBhIHRlbXBsYXRlIG5hbWVzcGFjZSBhcyBzdHJpbmchJyk7XG5cbiAgICBIZWxwZXJzLnF1ZXJ5U2VsZWN0b3JBcnJheShvYmoudGVtcGxhdGVOYW1lKS5mb3JFYWNoKGZ1bmN0aW9uKHRwbCkge1xuICAgICAgICBsZXQgcGFyZW50ID0gdHBsLnBhcmVudE5vZGU7XG4gICAgICAgIGxldCBjb250ZW50ID0gdHBsLmNvbnRlbnQuY2hpbGRyZW5bMF07XG5cbiAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjb250ZW50LCB0cGwpO1xuICAgIH0pO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT1RIRVIgSEVMUEVSU1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERldGVybWluZSBjbGljayBoYW5kbGVyLlxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuSGVscGVycy5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSGVscGVycy5pc1RvdWNoKCkgPyAndG91Y2hzdGFydCcgOiAnY2xpY2snO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBzY3JpcHQgaXMgYWxyZWFkeSBhZGRlZCxcbiAqIGFuZCByZXR1cm5zIHRydWUgb3IgZmFsc2VcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gVVJMIHRvIHlvdXIgc2NyaXB0XG4gKlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuSGVscGVycy5jaGVja1NjcmlwdCA9IGZ1bmN0aW9uKHVybCkge1xuICAgIGxldCB4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG4gICAgbGV0IHNjcmlwdEFkZGVkID0gZmFsc2U7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHhbaV0uc3JjID09IHVybCkge1xuICAgICAgICAgICAgc2NyaXB0QWRkZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzY3JpcHRBZGRlZDtcbn07XG5cbi8qKlxuICogTG9hZCBzY3JpcHRzIGFzeW5jaHJvbm91cyxcbiAqIGNoZWNrIGlmIHNjcmlwdCBpcyBhbHJlYWR5IGFkZGVkLFxuICogb3B0aW9uYWwgY2hlY2sgaWYgc2NyaXB0IGlzIGZ1bGx5IGxvYWRlZCBhbmRcbiAqIGV4ZWN1dGUgY2FsbGJhY2sgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFVSTCB0byB5b3VyIHNjcmlwdFxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tGbiAtIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gY2FsbGJhY2tPYmogLSB0aGlzIGNvbnRleHRcbiAqL1xuSGVscGVycy5sb2FkU2NyaXB0ID0gZnVuY3Rpb24odXJsLCBjYWxsYmFja0ZuLCBjYWxsYmFja09iaikge1xuICAgIGxldCBzY3JpcHRBZGRlZCA9IEhlbHBlcnMuY2hlY2tTY3JpcHQodXJsKTtcbiAgICBsZXQgc2NyaXB0O1xuXG4gICAgaWYgKHNjcmlwdEFkZGVkID09PSBmYWxzZSkge1xuICAgICAgICBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICBzY3JpcHQuc3JjID0gdXJsO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgfVxuXG4gICAgaWYgKGNhbGxiYWNrRm4gJiYgdHlwZW9mKGNhbGxiYWNrRm4pID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKHNjcmlwdEFkZGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjYWxsYmFja0ZuLmFwcGx5KGNhbGxiYWNrT2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoeC5yZWFkeVN0YXRlID09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbi5hcHBseShjYWxsYmFja09iaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0ZuLmFwcGx5KGNhbGxiYWNrT2JqKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5cbi8qKlxuICogQWRkL1VwZGF0ZSBtdWx0aXBsZSBwYXJhbWV0ZXJzIGZvciBnaXZlbiB1cmxcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsIC0gdXJsIG9uIHdoaWNoIHBhcmFtZXRlcnMgc2hvdWxkIGJlIGFkZGVkIC8gdXBkYXRlZFxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyAtIHBhcmFtZXRlcnMgKG5hbWUvdmFsdWUpXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSAtIHJlc3VsdGluZyB1cmxcbiAqL1xuSGVscGVycy51cGRhdGVVcmwgPSBmdW5jdGlvbih1cmwsIHBhcmFtcykge1xuICAgIGxldCB1cmxQYXJ0cyA9IHVybC5zcGxpdCgnPycpO1xuICAgIGxldCB0bXBQYXJhbXMgPSBbXTtcbiAgICBsZXQgb3JpZ2luYWxQYXJhbXMgPSBbXTtcbiAgICBsZXQgbmV3UGFyYW1zID0gW107XG4gICAgbGV0IGJhc2VVcmwgPSAnJztcbiAgICBsZXQgcHJvcGVydHkgPSAnJztcbiAgICBsZXQgdXBkYXRlZCA9IGZhbHNlO1xuICAgIGxldCBpID0gMDtcbiAgICBsZXQgaiA9IDA7XG5cbiAgICBmb3IgKHByb3BlcnR5IGluIHBhcmFtcykge1xuICAgICAgICBpZiAocGFyYW1zLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICAgICAgdG1wUGFyYW1zLnB1c2goW3Byb3BlcnR5LCAnPScsIHBhcmFtc1twcm9wZXJ0eV1dLmpvaW4oJycpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJhc2VVcmwgPSB1cmxQYXJ0c1swXTtcbiAgICBvcmlnaW5hbFBhcmFtcyA9IHVybFBhcnRzLmxlbmd0aCA+IDEgPyB1cmxQYXJ0c1sxXS5zcGxpdCgnJicpIDogW107XG5cbiAgICBmb3IgKGk7IGkgPCB0bXBQYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdXBkYXRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBvcmlnaW5hbFBhcmFtcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHRtcFBhcmFtc1tpXSAmJiBvcmlnaW5hbFBhcmFtc1tqXS5zcGxpdCgnPScpWzBdID09PSB0bXBQYXJhbXNbaV0uc3BsaXQoJz0nKVswXSkge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsUGFyYW1zW2pdID0gdG1wUGFyYW1zW2ldO1xuICAgICAgICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1cGRhdGVkKSB7XG4gICAgICAgICAgICBuZXdQYXJhbXMucHVzaCh0bXBQYXJhbXNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIChbYmFzZVVybCwgJz8nLCBvcmlnaW5hbFBhcmFtcy5jb25jYXQobmV3UGFyYW1zKS5qb2luKCcmJyldLmpvaW4oJycpKTtcbn07XG5cblxuLyoqXG4gKiBHZXQgdmFsdWUgb2YgcGFyYW1ldGVyIGZvciBnaXZlbiB1cmxcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsIC0gZ2l2ZW4gdXJsXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFyYW0gLSBwYXJhbWV0ZXIgKG5hbWUpXG4gKlxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IC0gdmFsdWUgb2YgcGFyYW1ldGVyXG4gKi9cbkhlbHBlcnMuZ2V0UGFyYW1Gcm9tVXJsID0gZnVuY3Rpb24odXJsLCBwYXJhbSkge1xuICAgIGxldCB1cmxQYXJ0cyA9IHVybC5zcGxpdCgnPycpO1xuICAgIGxldCBvcmlnaW5hbFBhcmFtcyA9IHVybFBhcnRzLmxlbmd0aCA+IDEgPyB1cmxQYXJ0c1sxXS5zcGxpdCgnJicpIDogW107XG4gICAgbGV0IGkgPSAwO1xuXG4gICAgZm9yIChpOyBpIDwgb3JpZ2luYWxQYXJhbXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBpZiAob3JpZ2luYWxQYXJhbXNbaV0uaW5kZXhPZihwYXJhbSkgPT09IDApIHtcbiAgICAgICAgICAgIGxldCBrZXlWYWwgPSBvcmlnaW5hbFBhcmFtc1tpXS5zcGxpdCgnPScpO1xuXG4gICAgICAgICAgICByZXR1cm4ga2V5VmFsLmxlbmd0aCA+IDEgPyBrZXlWYWxbMV0gOiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuXG4vKipcbiAqIEdlbmVyYXRlcyBudW1lcmljIGlkLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2VnbWVudHM9MV0gLSBudW1iZXIgb2Ygc2VnbWVudHMgb2YgZ2VuZXJhdGVkIGlkIChzZWdtZW50cyBjb25zaXN0IG9mIDEwIGRpZ2l0cywgc2VwYXJhdGVkIGJ5ICctJykuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSAtIGdlbmVyYXRlZCBpZFxuICovXG5IZWxwZXJzLm1ha2VJZCA9IGZ1bmN0aW9uKHNlZ21lbnRzID0gMSkge1xuICAgIGxldCBhcnJheSA9IHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50MzJBcnJheShzZWdtZW50cykpO1xuICAgIGxldCBpZCA9ICcnO1xuICAgIGxldCBpID0gMDtcblxuICAgIGZvciAoOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWQgKz0gYXJyYXlbaV0gKyAnLSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlkLnNsaWNlKDAsIC0xKTtcbn07XG5cblxuLyoqXG4gKiBEZXRlY3Qgc3dpcGUgZ2VzdHVyZXNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWwgLSBlbGVtZW50IHRvIGRldGVjdCBzd2lwZXMgb25cbiAqIEBwYXJhbSB7TnVtYmVyfSB0aHJlc2hvbGQgLSB0aHJlc2hvbGQgZm9yIHN3aXBlIChpbiBweClcbiAqL1xuSGVscGVycy5kZXRlY3RTd2lwZSA9IGZ1bmN0aW9uKGVsLCB0aHJlc2hvbGQpIHtcbiAgICBsZXQgdG91Y2hzdGFydFggPSAwO1xuICAgIGxldCB0b3VjaHN0YXJ0WSA9IDA7XG4gICAgbGV0IHRvdWNoZW5kWCA9IDA7XG4gICAgbGV0IHRvdWNoZW5kWSA9IDA7XG4gICAgbGV0IHN3aXBlVGhyZXNob2xkID0gdGhyZXNob2xkIHx8IDA7XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVTd2lwZSgpIHtcbiAgICAgICAgbGV0IGRlbHRhWCA9IE1hdGguYWJzKHRvdWNoc3RhcnRYIC0gdG91Y2hlbmRYKTtcbiAgICAgICAgbGV0IGRlbHRhWSA9IE1hdGguYWJzKHRvdWNoc3RhcnRZIC0gdG91Y2hlbmRZKTtcblxuICAgICAgICBpZiAoZGVsdGFYID4gc3dpcGVUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGlmICh0b3VjaGVuZFggPCB0b3VjaHN0YXJ0WCkge1xuICAgICAgICAgICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdzd2lwZScsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246ICdsZWZ0J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodG91Y2hlbmRYID4gdG91Y2hzdGFydFgpIHtcbiAgICAgICAgICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnc3dpcGUnLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAncmlnaHQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVsdGFZID4gc3dpcGVUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGlmICh0b3VjaGVuZFkgPCB0b3VjaHN0YXJ0WSkge1xuICAgICAgICAgICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdzd2lwZScsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246ICd1cCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRvdWNoZW5kWSA+IHRvdWNoc3RhcnRZKSB7XG4gICAgICAgICAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3N3aXBlJywge1xuICAgICAgICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ2Rvd24nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICB0b3VjaHN0YXJ0WCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICB0b3VjaHN0YXJ0WSA9IGUudG91Y2hlc1swXS5jbGllbnRZO1xuICAgIH0sIGZhbHNlKTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZSkge1xuICAgICAgICB0b3VjaGVuZFggPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgIHRvdWNoZW5kWSA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WTtcblxuICAgICAgICBoYW5kbGVTd2lwZSgpO1xuXG4gICAgfSwgZmFsc2UpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSGVscGVyczsiLCIvLyBQb2x5ZmlsbCBmb3IgY3VzdG9tIGV2ZW50c1xuKGZ1bmN0aW9uICgpIHtcblx0aWYgKHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgPT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZTtcblxuXHRmdW5jdGlvbiBDdXN0b21FdmVudChldmVudCwgcGFyYW1zKSB7XG5cdFx0cGFyYW1zID0gcGFyYW1zIHx8IHtidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogZmFsc2UsIGRldGFpbDogdW5kZWZpbmVkfTtcblx0XHR2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG5cdFx0ZXZ0LmluaXRDdXN0b21FdmVudChldmVudCwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcblx0XHRyZXR1cm4gZXZ0O1xuXHR9XG5cblx0Q3VzdG9tRXZlbnQucHJvdG90eXBlID0gd2luZG93LkV2ZW50LnByb3RvdHlwZTtcblxuXHR3aW5kb3cuQ3VzdG9tRXZlbnQgPSBDdXN0b21FdmVudDtcbn0pKCk7Il19
