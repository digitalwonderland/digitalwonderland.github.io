(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXNvdXJjZXMvanMvYXBwLmpzIiwicmVzb3VyY2VzL2pzL21haW4uanMiLCJyZXNvdXJjZXMvanMvdXRpbHMvZXZlbnRzLmpzIiwicmVzb3VyY2VzL2pzL3V0aWxzL2hlbHBlcnMuanMiLCJyZXNvdXJjZXMvanMvdXRpbHMvcG9seWZpbGxzL2N1c3RvbS1ldmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7Ozs7OztBQUVBOzs7O0FBRUE7Ozs7OztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQU0sY0FBYyxRQUFRLGFBQVIsQ0FBcEI7O0FBRUEsUUFBUSxXQUFSOztrQkFFZ0IsWUFBVztBQUN2Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBQ0EsUUFBSSxPQUFPLE1BQVg7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxTQUFLLFFBQUwsQ0FBYyxDQUFkLEdBQWtCLENBQWxCOztBQUVBO0FBQ0EsUUFBSSxNQUFNLEtBQUssR0FBTCxHQUFXLGtCQUFRLE1BQVIsQ0FBZSxPQUFPLEdBQVAsSUFBYyxFQUE3QixFQUFpQztBQUNsRCxjQUFNLGtCQUFRLE1BQVIsQ0FBZSxFQUFmLEVBQW1CLFlBQVksTUFBL0I7QUFENEMsS0FBakMsQ0FBckI7O0FBSUE7QUFDQSxRQUFJLFdBQUosR0FBa0IsV0FBbEI7QUFDQSxRQUFJLENBQUosR0FBUSxDQUFSO0FBQ0EsUUFBSSxNQUFKOztBQUVBOzs7OztBQUtBLFFBQUksYUFBSixHQUFvQixVQUFTLE9BQVQsRUFBa0I7QUFDbEMsb0JBQVksSUFBWixDQUFpQixJQUFqQixDQUFzQixJQUF0QixFQUE0QixPQUE1QjtBQUNILEtBRkQ7QUFHQSxRQUFJLGNBQUosR0FBcUIsVUFBUyxPQUFULEVBQWtCO0FBQ25DLG9CQUFZLEtBQVosQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0I7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R0FBUDtBQUNBOztBQUVELGFBQVksU0FBWixHQUF3QixPQUFPLEtBQVAsQ0FBYSxTQUFyQzs7QUFFQSxRQUFPLFdBQVAsR0FBcUIsV0FBckI7QUFDQSxDQWJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgSGVscGVycyBmcm9tICcuL3V0aWxzL2hlbHBlcnMnO1xuXG5pbXBvcnQgRVZFTlRTIGZyb20gJy4vdXRpbHMvZXZlbnRzJztcblxuY29uc3QgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuY29uc3QgRXhvc2tlbGV0b24gPSByZXF1aXJlKCdleG9za2VsZXRvbicpO1xuXG5yZXF1aXJlKCdyZXNwaW1hZ2UnKTtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBHTE9CQUwgTkFNRVNQQUNFXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gU2F2ZSBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdFxuICAgIGxldCByb290ID0gd2luZG93O1xuICAgIHJvb3QuQmFja2JvbmUgPSB7fTtcbiAgICByb290LkJhY2tib25lLiQgPSAkO1xuXG4gICAgLy8gQGJvcnJvdyBvYmplY3RzXG4gICAgbGV0IEFwcCA9IHJvb3QuQXBwID0gSGVscGVycy5leHRlbmQod2luZG93LkFwcCB8fCB7fSwge1xuICAgICAgICBWZW50OiBIZWxwZXJzLmV4dGVuZCh7fSwgRXhvc2tlbGV0b24uRXZlbnRzKVxuICAgIH0pO1xuXG4gICAgLy8gQWRkIGdsb2JhbHNcbiAgICBBcHAuRXhvc2tlbGV0b24gPSBFeG9za2VsZXRvbjtcbiAgICBBcHAuJCA9ICQ7XG4gICAgQXBwLkVWRU5UUyA9IEVWRU5UUztcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBjdXN0b20gdmlldyB3aXRoIG93biBwcm9wZXJ0aWVzIGFuZFxuICAgICAqIHRha2UgdGhpcyB2aWV3IGluIG91ciBtb2R1bGVzXG4gICAgICogcmVnaXN0ZXIgb25seSBvbmUgcmVmZXJlbmNlIHRvIG91ciBnbG9iYWwgbGlicmFyeSBFeG9za2VsZXRvblxuICAgICAqL1xuICAgIEFwcC5Db21wb25lbnRWaWV3ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBFeG9za2VsZXRvbi5WaWV3LmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgfTtcbiAgICBBcHAuQ29tcG9uZW50TW9kZWwgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIEV4b3NrZWxldG9uLk1vZGVsLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgfTtcbiAgICBBcHAuQ29tcG9uZW50Q29sbGVjdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgRXhvc2tlbGV0b24uQ29sbGVjdGlvbi5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBIZWxwZXJzLmV4dGVuZChBcHAuQ29tcG9uZW50Vmlldy5wcm90b3R5cGUsIEV4b3NrZWxldG9uLlZpZXcucHJvdG90eXBlLCB7fSk7XG4gICAgSGVscGVycy5leHRlbmQoQXBwLkNvbXBvbmVudE1vZGVsLnByb3RvdHlwZSwgRXhvc2tlbGV0b24uTW9kZWwucHJvdG90eXBlLCB7fSk7XG4gICAgSGVscGVycy5leHRlbmQoQXBwLkNvbXBvbmVudENvbGxlY3Rpb24ucHJvdG90eXBlLCBFeG9za2VsZXRvbi5Db2xsZWN0aW9uLnByb3RvdHlwZSwge30pO1xuXG4gICAgQXBwLkNvbXBvbmVudFZpZXcuZXh0ZW5kID0gRXhvc2tlbGV0b24uVmlldy5leHRlbmQ7XG4gICAgQXBwLkNvbXBvbmVudE1vZGVsLmV4dGVuZCA9IEV4b3NrZWxldG9uLk1vZGVsLmV4dGVuZDtcbiAgICBBcHAuQ29tcG9uZW50Q29sbGVjdGlvbi5leHRlbmQgPSBFeG9za2VsZXRvbi5Db2xsZWN0aW9uLmV4dGVuZDtcblxuICAgIC8qKlxuICAgICAqIEFkZCBvdXIgTWl4aW4gdG8gb3VyIFZpZXcgb2JqZWN0LlxuICAgICAqL1xuICAgIEFwcC5Db21wb25lbnRWaWV3LmNsYXNzTWl4aW4gPSBIZWxwZXJzLmNsYXNzTWl4aW47XG5cbiAgICAvLyBGZWF0dXJlIGRldGVjdGlvblxuICAgIEFwcC5zdXBwb3J0ID0gQXBwLnN1cHBvcnQgfHwge307XG4gICAgQXBwLnN1cHBvcnQudG91Y2ggPSBIZWxwZXJzLmlzVG91Y2goKTtcbiAgICBBcHAuY2xpY2tIYW5kbGVyID0gSGVscGVycy5jbGlja0hhbmRsZXIoKTtcblxuICAgIC8vIFZlcnNpb25pbmdcbiAgICBBcHAudmVyc2lvbiA9IFwiMC4wLjFcIjtcblxuICAgIC8vIEdsb2JhbCBtb2R1bGUgcmVnaXN0cnlcbiAgICBBcHAubW9kdWxlcyA9IHt9O1xuXG4gICAgLy8gQWRkIG1vZHVsZSB0byBnbG9iYWwgcmVnaXN0cnlcbiAgICBBcHAucmVnaXN0ZXJNb2R1bGUgPSBmdW5jdGlvbihtb2R1bGUsIGVsKSB7XG4gICAgICAgIGlmICghQXBwLm1vZHVsZXNbbW9kdWxlLm5hbWVdKSB7XG4gICAgICAgICAgICBBcHAubW9kdWxlc1ttb2R1bGUubmFtZV0gPSBtb2R1bGU7XG4gICAgICAgICAgICBBcHAubW9kdWxlc1ttb2R1bGUubmFtZV0ubm9kZXMgPSBbZWxdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQXBwLm1vZHVsZXNbbW9kdWxlLm5hbWVdLm5vZGVzLnB1c2goZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgQXBwLlZlbnQudHJpZ2dlcihBcHAuRVZFTlRTLm1vZHVsZVJlZ2lzdGVyZWQsIHtcbiAgICAgICAgICAgIG1vZHVsZTogbW9kdWxlLFxuICAgICAgICAgICAgZWw6IGVsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBNZWRpYSBRdWVyeVxuICAgIGxldCBoZWFkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaGVhZCcpO1xuICAgIEFwcC5jdXJyZW50TWVkaWEgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShoZWFkWzBdLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LWZhbWlseScpO1xuXG4gICAgLy8gU2NyZWVuIFNpemVcbiAgICBBcHAuc2NyZWVuU2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IHJvb3QuaW5uZXJXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiByb290LmlubmVySGVpZ2h0XG4gICAgfTtcblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBDSEVDS0lOR1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAgaWYgKGRvY3VtZW50LmxvY2F0aW9uLnNlYXJjaC5pbmRleE9mKCdkZXZtb2RlJykgPiAtMSkge1xuICAgICAgICBBcHAuZGV2bW9kZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGRvY3VtZW50LmxvY2F0aW9uLnNlYXJjaC5pbmRleE9mKCdsb2dnZXInKSA+IC0xKSB7XG4gICAgICAgIEFwcC5sb2dnZXIgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGhpZGUgYWxsIHdhcm5pbmdzIGFuZCBsb2dzIGlmIG5vdCBpbiBkZXZtb2RlXG4gICAgaWYgKCFBcHAuZGV2bW9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZyA9IGNvbnNvbGUud2FybiA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuXG4gICAgLy8gYWRkIGNvbnNvbGUgb3V0cHV0IGVsZW1lbnQgKHRyaWdnZXJlZCBieSBwYXJhbWV0ZXIgJ2Rldm1vZGUnIGFuZCAnbG9nZ2VyJyBpbiB1cmwpXG4gICAgaWYgKEFwcC5kZXZtb2RlICYmIEFwcC5sb2dnZXIpIHtcbiAgICAgICAgbGV0IGxvZ2dlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuXG4gICAgICAgIGxvZ2dlci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2xvZ2dlcicpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvZ2dlcik7XG5cbiAgICAgICAgY29uc29sZS53cml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1tpXSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5uZXJIVE1MICs9IChKU09OICYmIEpTT04uc3RyaW5naWZ5ID8gSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzW2ldLCB1bmRlZmluZWQsIDIpIDogYXJndW1lbnRzW2ldKSArICc8YnIgLz4nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbm5lckhUTUwgKz0gYXJndW1lbnRzW2ldICsgJzxiciAvPic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2dnZXIuaW5uZXJIVE1MICs9ICc8YnIgLz4nO1xuICAgICAgICAgICAgbG9nZ2VyLnNjcm9sbFRvcCA9IGxvZ2dlci5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9nZ2VyLmlubmVySFRNTCArPSAnW0Vycm9yXTxiciAvPic7XG4gICAgICAgICAgICBjb25zb2xlLndyaXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS53YXJuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5uZXJIVE1MICs9ICdbV2Fybl08YnIgLz4nO1xuICAgICAgICAgICAgY29uc29sZS53cml0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5uZXJIVE1MICs9ICdbTG9nXTxiciAvPic7XG4gICAgICAgICAgICBjb25zb2xlLndyaXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gR0xPQkFMIEVWRU5UU1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8qKlxuICAgICAqIFRyaWdnZXJzXG4gICAgICovXG5cbiAgICAvLyBUcmlnZ2VyIGdsb2JhbCByZXNpemUgZXZlbnRcbiAgICB3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGxldCBjdXJyZW50TWVkaWEgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShoZWFkWzBdLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LWZhbWlseScpO1xuICAgICAgICBsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblxuICAgICAgICBpZiAoY3VycmVudE1lZGlhICE9PSBBcHAuY3VycmVudE1lZGlhKSB7XG4gICAgICAgICAgICBsZXQgb2xkTWVkaWEgPSBBcHAuY3VycmVudE1lZGlhO1xuXG4gICAgICAgICAgICBBcHAuY3VycmVudE1lZGlhID0gY3VycmVudE1lZGlhO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FwcC5jdXJyZW50TWVkaWE6ICcsIEFwcC5jdXJyZW50TWVkaWEpO1xuXG4gICAgICAgICAgICBBcHAuVmVudC50cmlnZ2VyKEFwcC5FVkVOVFMubWVkaWFjaGFuZ2UsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBBcHAuRVZFTlRTLm1lZGlhY2hhbmdlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRNZWRpYTogY3VycmVudE1lZGlhLFxuICAgICAgICAgICAgICAgIG9sZE1lZGlhOiBvbGRNZWRpYVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2lkdGggIT0gQXBwLnNjcmVlblNpemUud2lkdGgpIHtcbiAgICAgICAgICAgIEFwcC5zY3JlZW5TaXplLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBBcHAuVmVudC50cmlnZ2VyKEFwcC5FVkVOVFMucmVzaXplLCBlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5vbnNjcm9sbCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgQXBwLlZlbnQudHJpZ2dlcihBcHAuRVZFTlRTLnNjcm9sbCwgZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBBcHA7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIvLyBNYWluIFJlcXVpcmVtZW50c1xuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCc7XG5pbXBvcnQgSGVscGVycyBmcm9tICcuL3V0aWxzL2hlbHBlcnMnO1xuXG4vLyBFUzYgTW9kdWxlc1xuXG4vLyBASU5TRVJUUE9JTlQgOjogQHJlZjoganMtaW1wb3J0XG5cbi8vIFZhcnNcbmNvbnN0ICQgPSBBcHAuJDtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBNYWluIEZ1bmN0aW9uYWxpdHlcbmNsYXNzIENvcmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIG91ciBjb3JlIGZ1bmN0aW9uYWxpdHlcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgb25seSBiZSBleGVjdXRlZCBvbmNlLlxuICAgICAqL1xuICAgIGluaXRpYWxpemUoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBcHAgaW5pdGlhbGl6ZWQgd2l0aCB2ZXJzaW9uOiAnLCBBcHAudmVyc2lvbik7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERldGVjdCBUb3VjaFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKCFBcHAuc3VwcG9ydC50b3VjaCkge1xuICAgICAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCduby10b3VjaCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnaHRtbCcpLmFkZENsYXNzKCd0b3VjaCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVkaXJlY3RcbiAgICAgICAgQXBwLlZlbnQub24oQXBwLkVWRU5UUy5ET01yZWRpcmVjdCwgKG9iaikgPT4ge1xuICAgICAgICAgICAgaWYgKCFvYmogJiYgIW9iai51cmwpIHRocm93IG5ldyBFcnJvcignT2JqZWN0IGlzIG5vdCBkZWZpbmVkLiBQbGVhc2UgcHJvdmlkZSBhbiB1cmwgaW4geW91ciBvYmplY3QhJyk7XG5cbiAgICAgICAgICAgIC8vIFJlZGlyZWN0IHRvIHBhZ2VcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gU3RyaW5nKG9iai51cmwpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBASU5TRVJUUE9JTlQgOjogQHJlZjoganMtaW5pdC1vbmNlLXYzXG5cbiAgICB9XG5cbiAgICBwcmVSZW5kZXIoKSB7XG4gICAgICAgIEhlbHBlcnMuc2F2ZURPTSgpO1xuICAgIH1cblxuICAgIHJlbmRlcihjb250ZXh0KSB7XG4gICAgICAgIC8vIEBJTlNFUlRQT0lOVCA6OiBAcmVmOiBqcy1pbml0LXYzXG5cbiAgICB9XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xuICAgIGxldCBjb3JlID0gbmV3IENvcmUoKTtcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBtb2R1bGVzXG4gICAgICovXG4gICAgY29yZS5wcmVSZW5kZXIoKTtcbiAgICBjb3JlLnJlbmRlcihkb2N1bWVudCk7XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIG1vZHVsZXMgd2hpY2ggYXJlIGxvYWRlZCBhZnRlciBpbml0aWFsIGxvYWRcbiAgICAgKiB2aWEgY3VzdG9tIGV2ZW50ICdET01jaGFuZ2VkJ1xuICAgICAqL1xuICAgIEFwcC5WZW50Lm9uKEFwcC5FVkVOVFMuRE9NY2hhbmdlZCwgKGNvbnRleHQpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ0RvbSBoYXMgY2hhbmdlZC4gSW5pdGlhbGlzaW5nIG5ldyBtb2R1bGVzIGluOiAnLCBjb250ZXh0KTtcbiAgICAgICAgY29yZS5wcmVSZW5kZXIoKTtcbiAgICAgICAgY29yZS5yZW5kZXIoY29udGV4dCk7XG4gICAgfSk7XG59KTtcblxuXG4vLyBuYXYgdG9nZ2xlXG5cbiQoJyN0b2dnbGUnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkKCcjb3ZlcmxheScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG59KTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgJCgnLmJhcnMnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnI25hdicpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICQoJy5jb250YWluZXInKS50b2dnbGVDbGFzcygnbWVudS1vcGVuJyk7XG4gICAgfSk7XG59KTsiLCIvKipcbiAqIENvbnN0IGZvciBldmVudHMgKHB1Yi9zdWIpXG4gKlxuICogQGF1dGhvcjogU2ViYXN0aWFuIEZpdHpuZXJcbiAqL1xuXG4vKipcbiAqIEV2ZW50cyBHbG9iYWxcbiAqL1xuXG5jb25zdCBFVkVOVFMgPSB7XG5cdGJsdXI6ICdibHVyJyxcblx0Y2hhbmdlOiAnY2hhbmdlJyxcblx0Y2xpY2s6ICdjbGljaycsXG5cdGRibGNsaWNrOiAnZGJsY2xpY2snLFxuXHRET01jaGFuZ2VkOiAnRE9NY2hhbmdlZCcsXG5cdERPTXJlZGlyZWN0OiAnZG9tOnJlZGlyZWN0Jyxcblx0aGFzaGNoYW5nZTogJ2hhc2hjaGFuZ2UnLFxuXHRpbnB1dDogJ2lucHV0Jyxcblx0a2V5ZG93bjogJ2tleWRvd24nLFxuXHRrZXlwcmVzczogJ2tleXByZXNzJyxcblx0a2V5dXA6ICdrZXl1cCcsXG5cdG1lZGlhY2hhbmdlOiAnbWVkaWFjaGFuZ2UnLFxuXHRtb2R1bGVSZWdpc3RlcmVkOiAnbW9kdWxlUmVnaXN0ZXJlZCcsXG5cdG1vdXNlZG93bjogJ21vdXNlZG93bicsXG5cdG1vdXNlZW50ZXI6ICdtb3VzZWVudGVyJyxcblx0bW91c2VsZWF2ZTogJ21vdXNlbGVhdmUnLFxuXHRtb3VzZW91dDogJ21vdXNlb3V0Jyxcblx0bW91c2VvdmVyOiAnbW91c2VvdmVyJyxcblx0bW91c2V1cDogJ21vdXNldXAnLFxuXHRyZXNldDogJ3Jlc2V0Jyxcblx0cmVzaXplOiAncmVzaXplJyxcblx0c2Nyb2xsOiAnc2Nyb2xsJyxcblx0c3VibWl0OiAnc3VibWl0Jyxcblx0c3dpcGU6ICdzd2lwZSdcbn07XG5cbi8vIEBJTlNFUlRQT0lOVCA6OiBAcmVmOiBqcy1ldmVudHNcblxuZXhwb3J0IGRlZmF1bHQgRVZFTlRTO1xuIiwiLyoqXG4gKiBSZXByZXNlbnRzIGEgSGVscGVyIE9iamVjdC5cbiAqIEBtb2R1bGUgSGVscGVyXG4gKlxuICogQGF1dGhvciBTZWJhc3RpYW4gRml0em5lclxuICogQGF1dGhvciBBbmR5IEd1dHNjaGVcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogSW1wb3J0c1xuICovXG5pbXBvcnQgJy4vcG9seWZpbGxzL2N1c3RvbS1ldmVudCc7XG5cblxuLy8gQGFsaWFzIG1vZHVsZTogSGVscGVyc1xuXG5sZXQgSGVscGVycyA9IHt9O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNT0RVTEUgSEVMUEVSU1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNhdmUvVXBkYXRlIERPTSByZWZlcmVuY2VzIGZvciBKUyBNb2R1bGVzXG4gKlxuICpcbiAqL1xuSGVscGVycy5zYXZlRE9NID0gZnVuY3Rpb24oKSB7XG4gICAgSGVscGVycy5kYXRhSnNNb2R1bGVzID0gSGVscGVycy5xdWVyeVNlbGVjdG9yQXJyYXkoJ1tkYXRhLWpzLW1vZHVsZV0nKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG1vZHVsZSBhbmQgcmVuZGVyIGl0IGFuZC9vciBwcm92aWRlIGEgY2FsbGJhY2sgZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIC0gRGVmaW5pdGlvbiBvZiBvdXIgbW9kdWxlXG4gKiBAcGFyYW0ge3N0cmluZ30gb2JqLmVsIC0gUmVxdWlyZWQ6IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmouTW9kdWxlIC0gUmVxdWlyZWQ6IGNsYXNzIHdoaWNoIHdpbGwgYmUgdXNlZCB0byByZW5kZXIgeW91ciBtb2R1bGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29iai5yZW5kZXI9dHJ1ZV0gLSBPcHRpb25hbDogcmVuZGVyIHRoZSBjbGFzcywgaWYgZmFsc2UgdGhlIGNsYXNzIHdpbGwgb25seSBiZSBpbml0aWFsaXplZFxuICogQHBhcmFtIHtmdW5jdGlvbn0gW29iai5jYl0gLSBPcHRpb25hbDogcHJvdmlkZSBhIGZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgZXhlY3V0ZWQgYWZ0ZXIgaW5pdGlhbGlzYXRpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqLmNvbnRleHRdIC0gT3B0aW9uYWw6IGNvbnRleHQgb2YgbW9kdWxlXG4gKlxuICovXG5IZWxwZXJzLmxvYWRNb2R1bGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iai5kb21OYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ0luIG9yZGVyIHRvIHdvcmsgd2l0aCBsb2FkTW9kdWxlIHlvdSBuZWVkIHRvIGRlZmluZSB0aGUgbW9kdWxlIG5hbWUgKGRlZmluZWQgaW4gZGF0YS1qcy1tb2R1bGUgYXR0cmlidXRlKSBhcyBzdHJpbmchICcpO1xuICAgIGlmICghb2JqLm1vZHVsZSkgdGhyb3cgbmV3IEVycm9yKCdJbiBvcmRlciB0byB3b3JrIHdpdGggbG9hZE1vZHVsZSB5b3UgbmVlZCB0byBkZWZpbmUgYSBNb2R1bGUhJyk7XG5cbiAgICBsZXQgY29udGV4dCA9IG9iai5jb250ZXh0IHx8IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcbiAgICBsZXQgcmVuZGVyT25Jbml0ID0gb2JqLnJlbmRlciAhPT0gZmFsc2U7XG5cblxuICAgIEhlbHBlcnMuZm9yRWFjaChIZWxwZXJzLmRhdGFKc01vZHVsZXMsIChpLCBlbCkgPT4ge1xuICAgICAgICBsZXQgZGF0YU1vZHVsZXMgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtanMtbW9kdWxlJykuc3BsaXQoJyAnKTtcblxuICAgICAgICBpZiAoZGF0YU1vZHVsZXMuaW5kZXhPZihvYmouZG9tTmFtZSkgIT0gLTEgJiYgSGVscGVycy5jaGVja0VsZW1lbnRJbkNvbnRleHQoZWwsIGNvbnRleHQpKSB7XG4gICAgICAgICAgICBsZXQgYXR0cnMgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtanMtb3B0aW9ucycpO1xuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSBKU09OLnBhcnNlKGF0dHJzKTtcbiAgICAgICAgICAgIGxldCBtb2R1bGUgPSBuZXcgb2JqLm1vZHVsZSh7XG4gICAgICAgICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBSZW5kZXIgYWZ0ZXIgaW5pdGlhbCBtb2R1bGUgbG9hZGluZ1xuICAgICAgICAgICAgaWYgKHJlbmRlck9uSW5pdCkgbW9kdWxlLnJlbmRlcigpO1xuICAgICAgICAgICAgLy8gUHJvdmlkZSBjYWxsYmFjayBmdW5jdGlvbiBpbiB3aGljaCB5b3UgY2FuIHVzZSBtb2R1bGUgYW5kIG9wdGlvbnNcbiAgICAgICAgICAgIGlmIChvYmouY2IgJiYgdHlwZW9mKG9iai5jYikgPT09IFwiZnVuY3Rpb25cIikgb2JqLmNiKG1vZHVsZSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVYVEVORElORyBIRUxQRVJTXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2ltcGxlIGV4dGVuZCBtZXRob2QgdG8gZXh0ZW5kIHRoZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIC0gb2JqZWN0IHdoaWNoIHdpbGwgYmUgZXh0ZW5kZWRcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IG9iaiAtIGV4dGVuZGVkIG9iamVjdFxuICovXG5IZWxwZXJzLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZChvYmopIHtcbiAgICBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gaXRlbSkgb2JqW2tleV0gPSBpdGVtW2tleV07XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbn07XG5cbi8qKlxuICogU2ltcGxlIGV4dGVuZCBtZXRob2QsIHdoaWNoIGV4dGVuZHMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogLSBvYmplY3Qgd2hpY2ggd2lsbCBiZSBleHRlbmRlZFxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gb2JqIC0gZXh0ZW5kZWQgb2JqZWN0XG4gKi9cbkhlbHBlcnMuZGVmYXVsdHMgPSBmdW5jdGlvbiBkZWZhdWx0cyhvYmopIHtcbiAgICBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gaXRlbSkge1xuICAgICAgICAgICAgaWYgKG9ialtrZXldID09PSB1bmRlZmluZWQpIG9ialtrZXldID0gaXRlbVtrZXldO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbn07XG5cbi8qKlxuICogTWVyZ2UgbWV0aG9kIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZnJvbSAtIE1peGluIG9iamVjdCB3aGljaCB3aWxsIGJlIG1lcmdlZCB2aWEgSGVscGVycy5kZWZhdWx0cyB3aXRoIHRoZSBtZXRob2RzIG9mIG91ciBjbGFzc1xuICogQHBhcmFtIHtBcnJheX0gbWV0aG9kcyAtIEFycmF5IG9mIG1ldGhvZCBuYW1lcyB3aGljaCB3aWxsIGJlIGV4dGVuZGVkLlxuICovXG5IZWxwZXJzLmNsYXNzTWl4aW4gPSBmdW5jdGlvbihmcm9tLCBtZXRob2RzID0gWydpbml0aWFsaXplJywgJ3JlbmRlciddKSB7XG5cbiAgICBsZXQgdG8gPSB0aGlzLnByb3RvdHlwZTtcblxuICAgIC8qKiBBZGQgdGhvc2UgbWV0aG9kcyB3aGljaCBleGlzdHMgb24gYGZyb21gIGJ1dCBub3Qgb24gYHRvYCB0byB0aGUgbGF0dGVyICovXG4gICAgSGVscGVycy5kZWZhdWx0cyh0bywgZnJvbSk7XG5cbiAgICAvKiogd2UgZG8gdGhlIHNhbWUgZm9yIGV2ZW50cyAqL1xuICAgIGlmICh0by5ldmVudHMpIHtcbiAgICAgICAgSGVscGVycy5kZWZhdWx0cyh0by5ldmVudHMsIGZyb20uZXZlbnRzKTtcbiAgICB9XG5cbiAgICAvLyBFeHRlbmQgdG8ncyBtZXRob2RzXG4gICAgbWV0aG9kcy5mb3JFYWNoKChtZXRob2QpID0+IHtcbiAgICAgICAgSGVscGVycy5leHRlbmRNZXRob2QodG8sIGZyb20sIG1ldGhvZCk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gZXh0ZW5kIGFuIGFscmVhZHkgZXhpc3RpbmcgbWV0aG9kLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB0byAtIHZpZXcgd2hpY2ggd2lsbCBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGZyb20gLSBtZXRob2RzIHdoaWNoIGNvbWVzIGZyb20gbWl4aW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2ROYW1lIC0gZnVuY3Rpb24gbmFtZVxuICovXG5IZWxwZXJzLmV4dGVuZE1ldGhvZCA9IGZ1bmN0aW9uKHRvLCBmcm9tLCBtZXRob2ROYW1lKSB7XG4gICAgZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJztcbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgbWV0aG9kIGlzIGRlZmluZWQgb24gZnJvbSAuLi5cbiAgICBpZiAoIWlzVW5kZWZpbmVkKGZyb21bbWV0aG9kTmFtZV0pKSB7XG4gICAgICAgIGxldCBvbGQgPSB0b1ttZXRob2ROYW1lXTtcblxuICAgICAgICAvLyAuLi4gd2UgY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9uIHRvXG4gICAgICAgIHRvW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIHdoZXJlaW4gd2UgZmlyc3QgY2FsbCB0aGUgbWV0aG9kIHdoaWNoIGV4aXN0cyBvbiBgdG9gXG4gICAgICAgICAgICBsZXQgb2xkUmV0dXJuID0gb2xkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIC8vIGFuZCB0aGVuIGNhbGwgdGhlIG1ldGhvZCBvbiBgZnJvbWBcbiAgICAgICAgICAgIGZyb21bbWV0aG9kTmFtZV0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIHRoZSBleHBlY3RlZCByZXN1bHQsXG4gICAgICAgICAgICAvLyBpLmUuIHdoYXQgdGhlIG1ldGhvZCBvbiBgdG9gIHJldHVybnNcbiAgICAgICAgICAgIHJldHVybiBvbGRSZXR1cm47XG4gICAgICAgIH07XG4gICAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRlVOQ1RJT05BTCBIRUxQRVJTXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogR2V0IGRvbSBlbGVtZW50cyBpbiBhbiBhcnJheVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBlbGVtIC0gUmVxdWlyZWQ6IHNlbGVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gW2NvbnRleHRdIC0gT3B0aW9uYWw6IGNvbnRleHRcbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuSGVscGVycy5xdWVyeVNlbGVjdG9yQXJyYXkgPSBIZWxwZXJzLiQgPSBmdW5jdGlvbihlbGVtLCBjb250ZXh0KSB7XG4gICAgaWYgKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoJ0luIG9yZGVyIHRvIHdvcmsgd2l0aCBxdWVyeVNlbGVjdG9yQXJyYXkgeW91IG5lZWQgdG8gZGVmaW5lIGFuIGVsZW1lbnQgYXMgc3RyaW5nIScpO1xuICAgIGxldCBlbCA9IGVsZW07XG4gICAgbGV0IGN1c3RvbUNvbnRleHQgPSBjb250ZXh0IHx8IGRvY3VtZW50O1xuXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKChjdXN0b21Db250ZXh0KS5xdWVyeVNlbGVjdG9yQWxsKGVsKSk7XG59O1xuXG4vKipcbiAqIFNpbXBsZSBmb3JFYWNoIG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IC0gYXJyYXkgb2Ygb2JqZWN0c1xuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBjYWxsYmFjayBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHNjb3BlIC0gc2NvcGUgb2YgZnVuY3Rpb25cbiAqL1xuSGVscGVycy5mb3JFYWNoID0gZnVuY3Rpb24oYXJyYXksIGNhbGxiYWNrLCBzY29wZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbChzY29wZSwgaSwgYXJyYXlbaV0pO1xuICAgIH1cbn07XG5cbi8qKlxuICogRmluZCBpbmRleCBvZiBhIHNwZWNpZmljIGl0ZW0gaW4gYW4gYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgLSBhcnJheSBpbiB3aGljaCB3ZSBzZWFyY2ggZm9yXG4gKiBAcGFyYW0ge09iamVjdH0gaXRlbSAtIGl0ZW0gd2hpY2ggd2lsbCBiZSBzZWFyY2hlZFxuICovXG5IZWxwZXJzLmluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgbGV0IGw7XG4gICAgbGV0IGk7XG5cbiAgICBmb3IgKGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSsrKVxuICAgICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbn07XG5cbi8qKlxuICogUmV0dXJuIG5ldyBSZWdFeHBcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVnRXggLSBSZWd1bGFyIEV4cHJlc3Npb25cbiAqXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbkhlbHBlcnMucmVnRXhwID0gZnVuY3Rpb24ocmVnRXgpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChcIihefFxcXFxzKylcIiArIHJlZ0V4ICsgXCIoXFxcXHMrfCQpXCIpO1xufTtcblxuLyoqXG4gKiBUaHJvdHRsZSBtZXRob2QgZm9yIHJlc2l6ZSBldmVudHMgYW5kIG1vcmVcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gd2hpY2ggd2lsbCBiZSBleGVjdXRlZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0IC0gbnVtYmVyIHRvIHdhaXQgaW4gbWlsbGlzZWNvbmRzLlxuICogQHBhcmFtIHtib29sZWFufSBpbW1lZGlhdGUgLSBleGVjdXRlIGZ1bmN0aW9uIGltbWVkaWF0ZWx5LlxuICovXG5cbkhlbHBlcnMudGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICBsZXQgdGltZW91dDtcblxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgbGV0IGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICAgIGxldCBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIWltbWVkaWF0ZSkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG5cbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuXG4gICAgICAgIGlmIChjYWxsTm93KSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH07XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBERVRFQ1RJT04gSEVMUEVSU1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRvdWNoIERldGVjdGlvblxuICovXG5IZWxwZXJzLmlzVG91Y2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ29udG91Y2hzdGFydCcgaW4gd2luZG93O1xufTtcblxuLyoqXG4gKiBEZXRlY3QgdHJhbnNpdGlvbmVuZCBldmVudC5cbiAqL1xuSGVscGVycy50cmFuc2l0aW9uRW5kRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdDtcbiAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmYWtlZWxlbWVudCcpO1xuICAgIGxldCB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICAgJ3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdPVHJhbnNpdGlvbic6ICdvVHJhbnNpdGlvbkVuZCcsXG4gICAgICAgICdNb3pUcmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJ1xuICAgIH07XG5cbiAgICBmb3IgKHQgaW4gdHJhbnNpdGlvbnMpIHtcbiAgICAgICAgaWYgKGVsLnN0eWxlW3RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2l0aW9uc1t0XTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRGV0ZWN0IGFuaW1hdGlvbmVuZCBldmVudC5cbiAqL1xuSGVscGVycy5hbmltYXRpb25FbmRFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0O1xuICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zha2VlbGVtZW50Jyk7XG4gICAgbGV0IGFuaW1hdGlvbnMgPSB7XG4gICAgICAgICdhbmltYXRpb24nOiAnYW5pbWF0aW9uZW5kJyxcbiAgICAgICAgJ09BbmltYXRpb24nOiAnb0FuaW1hdGlvbkVuZCcsXG4gICAgICAgICdNb3pBbmltYXRpb24nOiAnYW5pbWF0aW9uZW5kJyxcbiAgICAgICAgJ1dlYmtpdEFuaW1hdGlvbic6ICd3ZWJraXRBbmltYXRpb25FbmQnXG4gICAgfTtcblxuICAgIGZvciAodCBpbiBhbmltYXRpb25zKSB7XG4gICAgICAgIGlmIChlbC5zdHlsZVt0XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYW5pbWF0aW9uc1t0XTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogUmVxdWVzdCBhbmltYXRpb24gZnJhbWVcbiAqXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn1cbiAqL1xuSGVscGVycy5yZXF1ZXN0QW5pRnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgICAgICB9O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ0hFQ0sgSEVMUEVSU1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIGJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9pbnV5YWtzYS9qcXVlcnkubmljZXNjcm9sbC9ibG9iL21hc3Rlci9qcXVlcnkubmljZXNjcm9sbC5qc1xuICpcbiAqIFRvZG86IG1lcmdlIHdpdGggY2hlY2tFbGVtZW50SW5Db250ZXh0XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5IZWxwZXJzLmhhc1BhcmVudCA9IGZ1bmN0aW9uKGUsIHApIHtcbiAgICBpZiAoIWUpIHJldHVybiBmYWxzZTtcbiAgICBsZXQgZWwgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQgfHwgZSB8fCBmYWxzZTtcbiAgICB3aGlsZSAoZWwgJiYgZWwgIT0gcCkge1xuICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGUgfHwgZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiAoZWwgIT09IGZhbHNlKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgZWxlbWVudCBpcyBpbiBhIHNwZWNpZmljIGNvbnRleHRcbiAqIGFuZCByZXR1cm4gc3RhdGUgYXMgYm9vbGVhblxuICpcbiAqIFRvZG86IG1lcmdlIHdpdGggaGFzUGFyZW50XG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIEVsZW1lbnQsIHdoaWNoIHdpbGwgYmUgY2hlY2tlZFxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBDb250ZXh0IGVsZW1lbnQsIGluIHdoaWNoIG91ciBlbGVtZW50IGNvdWxkIHBlcnNpc3RzXG4gKlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuSGVscGVycy5jaGVja0VsZW1lbnRJbkNvbnRleHQgPSBmdW5jdGlvbihlbGVtLCBjb250ZXh0KSB7XG4gICAgbGV0IGN1cnJlbnROb2RlID0gZWxlbTtcbiAgICBsZXQgY29udGV4dE5vZGUgPSBjb250ZXh0IHx8IGNvbnRleHQ7XG5cbiAgICB3aGlsZSAoY3VycmVudE5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLnBhcmVudE5vZGU7XG5cbiAgICAgICAgaWYgKEhlbHBlcnMuY2hlY2tOb2RlRXF1YWxpdHkoY3VycmVudE5vZGUsIGNvbnRleHROb2RlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIG5vZGUgaXMgcmVhbGx5IHRoZSBzYW1lXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgLSBPYmplY3QsIHdoaWNoIHdlIHdhbnQgdG8gY2hlY2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoyIC0gRWxlbWVudCwgd2hpY2ggd2Ugd2FudCB0byBjaGVjayBhZ2FpbnN0IGVxdWFsaXR5XG4gKlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuSGVscGVycy5jaGVja05vZGVFcXVhbGl0eSA9IGZ1bmN0aW9uKG9iajEsIG9iajIpIHtcbiAgICByZXR1cm4gKG9iajEgPT09IG9iajIpO1xufTtcblxuXG4vKipcbiAqIENoZWNrIGlmIGVsZW1lbnQgaXMgaW4gdmlld3BvcnRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIE9iamVjdCwgd2hpY2ggd2Ugd2FudCB0byBjaGVja1xuICogQHBhcmFtIHtib29sZWFufSB1c2VCb3VuZHMgLSBpZiB0cnVlLCB3aG9sZSBlbGVtZW50IG11c3QgYmUgdmlzaWJsZVxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkhlbHBlcnMuaXNJblZpZXdwb3J0ID0gZnVuY3Rpb24oZWxlbSwgdXNlQm91bmRzKSB7XG4gICAgbGV0IGVsID0gZWxlbTtcbiAgICBsZXQgdG9wID0gZWwub2Zmc2V0VG9wO1xuICAgIGxldCBsZWZ0ID0gZWwub2Zmc2V0TGVmdDtcbiAgICBsZXQgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcbiAgICBsZXQgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xuICAgIGxldCBjb25kID0gZmFsc2U7XG5cbiAgICB3aGlsZSAoZWwub2Zmc2V0UGFyZW50KSB7XG4gICAgICAgIGVsID0gZWwub2Zmc2V0UGFyZW50O1xuICAgICAgICB0b3AgKz0gZWwub2Zmc2V0VG9wO1xuICAgICAgICBsZWZ0ICs9IGVsLm9mZnNldExlZnQ7XG4gICAgfVxuXG4gICAgaWYgKHVzZUJvdW5kcykge1xuICAgICAgICBjb25kID0gdG9wID49IHdpbmRvdy5wYWdlWU9mZnNldCAmJiBsZWZ0ID49IHdpbmRvdy5wYWdlWE9mZnNldCAmJiAodG9wICsgaGVpZ2h0KSA8PSAod2luZG93LnBhZ2VZT2Zmc2V0ICsgd2luZG93LmlubmVySGVpZ2h0KSAmJiAobGVmdCArIHdpZHRoKSA8PSAod2luZG93LnBhZ2VYT2Zmc2V0ICsgd2luZG93LmlubmVyV2lkdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbmQgPSB0b3AgPCAod2luZG93LnBhZ2VZT2Zmc2V0ICsgd2luZG93LmlubmVySGVpZ2h0KSAmJiBsZWZ0IDwgKHdpbmRvdy5wYWdlWE9mZnNldCArIHdpbmRvdy5pbm5lcldpZHRoKSAmJiAodG9wICsgaGVpZ2h0KSA+IHdpbmRvdy5wYWdlWU9mZnNldCAmJiAobGVmdCArIHdpZHRoKSA+IHdpbmRvdy5wYWdlWE9mZnNldDtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZDtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIExBWU9VVCBIRUxQRVJTXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgb3V0ZXIgaGVpZ2h0IGZvciB0aGUgZ2l2ZW4gRE9NIGVsZW1lbnQsIGluY2x1ZGluZyB0aGVcbiAqIGNvbnRyaWJ1dGlvbnMgb2YgbWFyZ2luLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0gdGhlIGVsZW1lbnQgb2Ygd2hpY2ggdG8gY2FsY3VsYXRlIHRoZSBvdXRlciBoZWlnaHRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3V0ZXIgLSBhZGQgcGFkZGluZyB0byBoZWlnaHQgY2FsY3VsYXRpb25cbiAqXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbkhlbHBlcnMuZ2V0T3V0ZXJIZWlnaHQgPSBmdW5jdGlvbihlbGVtLCBvdXRlcikge1xuICAgIGxldCBlbCA9IGVsZW07XG4gICAgbGV0IGhlaWdodCA9IGVsLm9mZnNldEhlaWdodDtcblxuICAgIGlmIChvdXRlcikge1xuICAgICAgICBsZXQgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcbiAgICAgICAgaGVpZ2h0ICs9IHBhcnNlSW50KHN0eWxlLnBhZGRpbmdUb3ApICsgcGFyc2VJbnQoc3R5bGUucGFkZGluZ0JvdHRvbSk7XG4gICAgfVxuICAgIHJldHVybiBoZWlnaHQ7XG59O1xuXG4vKipcbiAqIFRlbXBsYXRpemVyIGNsZWFucyB1cCB0ZW1wbGF0ZSB0YWdzIGFuZCBpbnNlcnQgdGhlIGlubmVyIGh0bWwgYmVmb3JlIHRoZSB0YWdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIC0gQ29udGFpbnMgYWxsIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBvYmoudGVtcGxhdGVOYW1lIC0gRGVmaW5lcyB0aGUgdGVtcGxhdGUgbmFtZSB3aGljaCBpcyBhIHNlbGVjdG9yIGZyb20gdGhlIGVsZW1lbnRcbiAqL1xuSGVscGVycy50ZW1wbGF0aXplciA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHJldHVybjtcbiAgICBpZiAoIW9iaiAmJiAhb2JqLnRlbXBsYXRlTmFtZSkgdGhyb3cgbmV3IEVycm9yKCdZb3UgbmVlZCB0byBwYXNzIGEgdGVtcGxhdGUgbmFtZXNwYWNlIGFzIHN0cmluZyEnKTtcblxuICAgIEhlbHBlcnMucXVlcnlTZWxlY3RvckFycmF5KG9iai50ZW1wbGF0ZU5hbWUpLmZvckVhY2goZnVuY3Rpb24odHBsKSB7XG4gICAgICAgIGxldCBwYXJlbnQgPSB0cGwucGFyZW50Tm9kZTtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSB0cGwuY29udGVudC5jaGlsZHJlblswXTtcblxuICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNvbnRlbnQsIHRwbCk7XG4gICAgfSk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBPVEhFUiBIRUxQRVJTXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRGV0ZXJtaW5lIGNsaWNrIGhhbmRsZXIuXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5IZWxwZXJzLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBIZWxwZXJzLmlzVG91Y2goKSA/ICd0b3VjaHN0YXJ0JyA6ICdjbGljayc7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHNjcmlwdCBpcyBhbHJlYWR5IGFkZGVkLFxuICogYW5kIHJldHVybnMgdHJ1ZSBvciBmYWxzZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBVUkwgdG8geW91ciBzY3JpcHRcbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5IZWxwZXJzLmNoZWNrU2NyaXB0ID0gZnVuY3Rpb24odXJsKSB7XG4gICAgbGV0IHggPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcbiAgICBsZXQgc2NyaXB0QWRkZWQgPSBmYWxzZTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoeFtpXS5zcmMgPT0gdXJsKSB7XG4gICAgICAgICAgICBzY3JpcHRBZGRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNjcmlwdEFkZGVkO1xufTtcblxuLyoqXG4gKiBMb2FkIHNjcmlwdHMgYXN5bmNocm9ub3VzLFxuICogY2hlY2sgaWYgc2NyaXB0IGlzIGFscmVhZHkgYWRkZWQsXG4gKiBvcHRpb25hbCBjaGVjayBpZiBzY3JpcHQgaXMgZnVsbHkgbG9hZGVkIGFuZFxuICogZXhlY3V0ZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gVVJMIHRvIHlvdXIgc2NyaXB0XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja0ZuIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBjYWxsYmFja09iaiAtIHRoaXMgY29udGV4dFxuICovXG5IZWxwZXJzLmxvYWRTY3JpcHQgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrRm4sIGNhbGxiYWNrT2JqKSB7XG4gICAgbGV0IHNjcmlwdEFkZGVkID0gSGVscGVycy5jaGVja1NjcmlwdCh1cmwpO1xuICAgIGxldCBzY3JpcHQ7XG5cbiAgICBpZiAoc2NyaXB0QWRkZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2tGbiAmJiB0eXBlb2YoY2FsbGJhY2tGbikgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoc2NyaXB0QWRkZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrRm4uYXBwbHkoY2FsbGJhY2tPYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh4LnJlYWR5U3RhdGUgPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuLmFwcGx5KGNhbGxiYWNrT2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4uYXBwbHkoY2FsbGJhY2tPYmopO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblxuLyoqXG4gKiBBZGQvVXBkYXRlIG11bHRpcGxlIHBhcmFtZXRlcnMgZm9yIGdpdmVuIHVybFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgLSB1cmwgb24gd2hpY2ggcGFyYW1ldGVycyBzaG91bGQgYmUgYWRkZWQgLyB1cGRhdGVkXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIC0gcGFyYW1ldGVycyAobmFtZS92YWx1ZSlcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IC0gcmVzdWx0aW5nIHVybFxuICovXG5IZWxwZXJzLnVwZGF0ZVVybCA9IGZ1bmN0aW9uKHVybCwgcGFyYW1zKSB7XG4gICAgbGV0IHVybFBhcnRzID0gdXJsLnNwbGl0KCc/Jyk7XG4gICAgbGV0IHRtcFBhcmFtcyA9IFtdO1xuICAgIGxldCBvcmlnaW5hbFBhcmFtcyA9IFtdO1xuICAgIGxldCBuZXdQYXJhbXMgPSBbXTtcbiAgICBsZXQgYmFzZVVybCA9ICcnO1xuICAgIGxldCBwcm9wZXJ0eSA9ICcnO1xuICAgIGxldCB1cGRhdGVkID0gZmFsc2U7XG4gICAgbGV0IGkgPSAwO1xuICAgIGxldCBqID0gMDtcblxuICAgIGZvciAocHJvcGVydHkgaW4gcGFyYW1zKSB7XG4gICAgICAgIGlmIChwYXJhbXMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XG4gICAgICAgICAgICB0bXBQYXJhbXMucHVzaChbcHJvcGVydHksICc9JywgcGFyYW1zW3Byb3BlcnR5XV0uam9pbignJykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYmFzZVVybCA9IHVybFBhcnRzWzBdO1xuICAgIG9yaWdpbmFsUGFyYW1zID0gdXJsUGFydHMubGVuZ3RoID4gMSA/IHVybFBhcnRzWzFdLnNwbGl0KCcmJykgOiBbXTtcblxuICAgIGZvciAoaTsgaSA8IHRtcFBhcmFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB1cGRhdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChqID0gMDsgaiA8IG9yaWdpbmFsUGFyYW1zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAodG1wUGFyYW1zW2ldICYmIG9yaWdpbmFsUGFyYW1zW2pdLnNwbGl0KCc9JylbMF0gPT09IHRtcFBhcmFtc1tpXS5zcGxpdCgnPScpWzBdKSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQYXJhbXNbal0gPSB0bXBQYXJhbXNbaV07XG4gICAgICAgICAgICAgICAgdXBkYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXVwZGF0ZWQpIHtcbiAgICAgICAgICAgIG5ld1BhcmFtcy5wdXNoKHRtcFBhcmFtc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKFtiYXNlVXJsLCAnPycsIG9yaWdpbmFsUGFyYW1zLmNvbmNhdChuZXdQYXJhbXMpLmpvaW4oJyYnKV0uam9pbignJykpO1xufTtcblxuXG4vKipcbiAqIEdldCB2YWx1ZSBvZiBwYXJhbWV0ZXIgZm9yIGdpdmVuIHVybFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgLSBnaXZlbiB1cmxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXJhbSAtIHBhcmFtZXRlciAobmFtZSlcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gLSB2YWx1ZSBvZiBwYXJhbWV0ZXJcbiAqL1xuSGVscGVycy5nZXRQYXJhbUZyb21VcmwgPSBmdW5jdGlvbih1cmwsIHBhcmFtKSB7XG4gICAgbGV0IHVybFBhcnRzID0gdXJsLnNwbGl0KCc/Jyk7XG4gICAgbGV0IG9yaWdpbmFsUGFyYW1zID0gdXJsUGFydHMubGVuZ3RoID4gMSA/IHVybFBhcnRzWzFdLnNwbGl0KCcmJykgOiBbXTtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICBmb3IgKGk7IGkgPCBvcmlnaW5hbFBhcmFtcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIGlmIChvcmlnaW5hbFBhcmFtc1tpXS5pbmRleE9mKHBhcmFtKSA9PT0gMCkge1xuICAgICAgICAgICAgbGV0IGtleVZhbCA9IG9yaWdpbmFsUGFyYW1zW2ldLnNwbGl0KCc9Jyk7XG5cbiAgICAgICAgICAgIHJldHVybiBrZXlWYWwubGVuZ3RoID4gMSA/IGtleVZhbFsxXSA6IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cbi8qKlxuICogR2VuZXJhdGVzIG51bWVyaWMgaWQuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtzZWdtZW50cz0xXSAtIG51bWJlciBvZiBzZWdtZW50cyBvZiBnZW5lcmF0ZWQgaWQgKHNlZ21lbnRzIGNvbnNpc3Qgb2YgMTAgZGlnaXRzLCBzZXBhcmF0ZWQgYnkgJy0nKS5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IC0gZ2VuZXJhdGVkIGlkXG4gKi9cbkhlbHBlcnMubWFrZUlkID0gZnVuY3Rpb24oc2VnbWVudHMgPSAxKSB7XG4gICAgbGV0IGFycmF5ID0gd2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KHNlZ21lbnRzKSk7XG4gICAgbGV0IGlkID0gJyc7XG4gICAgbGV0IGkgPSAwO1xuXG4gICAgZm9yICg7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZCArPSBhcnJheVtpXSArICctJztcbiAgICB9XG5cbiAgICByZXR1cm4gaWQuc2xpY2UoMCwgLTEpO1xufTtcblxuXG4vKipcbiAqIERldGVjdCBzd2lwZSBnZXN0dXJlc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbCAtIGVsZW1lbnQgdG8gZGV0ZWN0IHN3aXBlcyBvblxuICogQHBhcmFtIHtOdW1iZXJ9IHRocmVzaG9sZCAtIHRocmVzaG9sZCBmb3Igc3dpcGUgKGluIHB4KVxuICovXG5IZWxwZXJzLmRldGVjdFN3aXBlID0gZnVuY3Rpb24oZWwsIHRocmVzaG9sZCkge1xuICAgIGxldCB0b3VjaHN0YXJ0WCA9IDA7XG4gICAgbGV0IHRvdWNoc3RhcnRZID0gMDtcbiAgICBsZXQgdG91Y2hlbmRYID0gMDtcbiAgICBsZXQgdG91Y2hlbmRZID0gMDtcbiAgICBsZXQgc3dpcGVUaHJlc2hvbGQgPSB0aHJlc2hvbGQgfHwgMDtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVN3aXBlKCkge1xuICAgICAgICBsZXQgZGVsdGFYID0gTWF0aC5hYnModG91Y2hzdGFydFggLSB0b3VjaGVuZFgpO1xuICAgICAgICBsZXQgZGVsdGFZID0gTWF0aC5hYnModG91Y2hzdGFydFkgLSB0b3VjaGVuZFkpO1xuXG4gICAgICAgIGlmIChkZWx0YVggPiBzd2lwZVRocmVzaG9sZCkge1xuICAgICAgICAgICAgaWYgKHRvdWNoZW5kWCA8IHRvdWNoc3RhcnRYKSB7XG4gICAgICAgICAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3N3aXBlJywge1xuICAgICAgICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ2xlZnQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0b3VjaGVuZFggPiB0b3VjaHN0YXJ0WCkge1xuICAgICAgICAgICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdzd2lwZScsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246ICdyaWdodCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWx0YVkgPiBzd2lwZVRocmVzaG9sZCkge1xuICAgICAgICAgICAgaWYgKHRvdWNoZW5kWSA8IHRvdWNoc3RhcnRZKSB7XG4gICAgICAgICAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3N3aXBlJywge1xuICAgICAgICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ3VwJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodG91Y2hlbmRZID4gdG91Y2hzdGFydFkpIHtcbiAgICAgICAgICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnc3dpcGUnLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAnZG93bidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRvdWNoc3RhcnRYID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgIHRvdWNoc3RhcnRZID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRvdWNoZW5kWCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgdG91Y2hlbmRZID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZO1xuXG4gICAgICAgIGhhbmRsZVN3aXBlKCk7XG5cbiAgICB9LCBmYWxzZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBIZWxwZXJzOyIsIi8vIFBvbHlmaWxsIGZvciBjdXN0b20gZXZlbnRzXG4oZnVuY3Rpb24gKCkge1xuXHRpZiAodHlwZW9mIHdpbmRvdy5DdXN0b21FdmVudCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlO1xuXG5cdGZ1bmN0aW9uIEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMpIHtcblx0XHRwYXJhbXMgPSBwYXJhbXMgfHwge2J1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiBmYWxzZSwgZGV0YWlsOiB1bmRlZmluZWR9O1xuXHRcdHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcblx0XHRldnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xuXHRcdHJldHVybiBldnQ7XG5cdH1cblxuXHRDdXN0b21FdmVudC5wcm90b3R5cGUgPSB3aW5kb3cuRXZlbnQucHJvdG90eXBlO1xuXG5cdHdpbmRvdy5DdXN0b21FdmVudCA9IEN1c3RvbUV2ZW50O1xufSkoKTsiXX0=
