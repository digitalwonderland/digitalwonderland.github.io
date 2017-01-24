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
//# sourceMappingURL=app.js.map
