(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ManhattanSortable"] = factory();
	else
		root["ManhattanSortable"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "sortable.css";

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var $, Sortable,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

	$ = __webpack_require__(3);

	Sortable = (function() {
	  Sortable.clsPrefix = 'data-mh-sortable--';

	  function Sortable(container, options) {
	    var children;
	    if (options == null) {
	      options = {};
	    }
	    this._grab = bind(this._grab, this);
	    this._drop = bind(this._drop, this);
	    this._drag = bind(this._drag, this);
	    console.log(123);
	    $.config(this, {
	      axis: 'vertical',
	      childSelector: null,
	      grabSelector: null
	    }, options, container, this.constructor.clsPrefix);
	    this._behaviours = {};
	    $.config(this._behaviours, {
	      before: 'auto',
	      children: 'children',
	      grabber: 'self',
	      helper: 'clone'
	    }, options, container, this.constructor.clsPrefix);
	    this._grabbed = null;
	    this._grabbedOffset = null;
	    this._dom = {};
	    this._dom.container = container;
	    this._dom.container.__mh_sortable = this;
	    this._dom.container.classList.add(this._bem('mh-sortable'));
	    Object.defineProperty(this, 'container', {
	      value: this._dom.container
	    });
	    Object.defineProperty(this, 'children', {
	      get: (function(_this) {
	        return function() {
	          var c;
	          return (function() {
	            var i, len, ref, results;
	            ref = this._dom.children;
	            results = [];
	            for (i = 0, len = ref.length; i < len; i++) {
	              c = ref[i];
	              results.push(c);
	            }
	            return results;
	          }).call(_this);
	        };
	      })(this)
	    });
	    children = this.constructor.behaviours.children[this._behaviours.children];
	    this._dom.children = children(this);
	    $.listen(document, {
	      'mousedown': this._grab,
	      'mousemove': this._drag,
	      'mouseup': this._drop,
	      'touchstart': this._grab,
	      'touchmove': this._drag,
	      'touchend': this._drop
	    });
	  }

	  Sortable.prototype.destroy = function() {
	    this.container.classList.remove(this._bem('mh-sortable'));
	    $.ignore(document, {
	      'mousedown': this._grab,
	      'mousemove': this._drag,
	      'mouseup': this._drop,
	      'touchstart': this._grab,
	      'touchmove': this._drag,
	      'touchend': this._drop
	    });
	    return delete this._dom.container.__mh_sortable;
	  };

	  Sortable.prototype._bem = function(block, element, modifier) {
	    var name;
	    if (element == null) {
	      element = '';
	    }
	    if (modifier == null) {
	      modifier = '';
	    }
	    name = block;
	    if (element) {
	      name = name + "__" + element;
	    }
	    if (modifier) {
	      name = name + "--" + modifier;
	    }
	    return name;
	  };

	  Sortable.prototype._clearSelection = function() {};

	  Sortable.prototype._et = function(eventName) {
	    return "mh-sortable--" + eventName;
	  };

	  Sortable.prototype._getEventPos = function(ev) {
	    if (ev.touches) {
	      ev = ev.touches[0];
	    }
	    return [ev.pageX - window.pageXOffset, ev.pageY - window.pageYOffset];
	  };

	  Sortable.prototype._drag = function(ev) {
	    var before, child, children, i, len, offset, pos, ref, sibling, target;
	    if (!this._grabbed) {
	      return;
	    }
	    pos = this._getEventPos(ev);
	    offset = [window.pageXOffset, window.pageYOffset];
	    this._dom.helper.style.left = (offset[0] + pos[0] - this._grabbedOffset[0]) + "px";
	    this._dom.helper.style.top = (offset[1] + pos[1] - this._grabbedOffset[1]) + "px";
	    target = document.elementFromPoint(pos[0], pos[1]);
	    sibling = null;
	    ref = this._dom.children;
	    for (i = 0, len = ref.length; i < len; i++) {
	      child = ref[i];
	      if (child === this._grabbed) {
	        continue;
	      }
	      if (child.contains(target)) {
	        sibling = child;
	        break;
	      }
	    }
	    if (!sibling) {
	      return;
	    }
	    before = this.constructor.behaviours.before[this._behaviours.before];
	    before = before(this, sibling, pos);
	    this.container.removeChild(this._grabbed);
	    if (!before) {
	      sibling = sibling.nextElementSibling;
	    }
	    this.container.insertBefore(this._grabbed, sibling);
	    children = this.constructor.behaviours.children[this._behaviours.children];
	    this._dom.children = children(this);
	    return $.dispatch(this.container, this._et('sort'), {
	      'children': this._dom.children
	    });
	  };

	  Sortable.prototype._drop = function(ev) {
	    if (!this._grabbed) {
	      return;
	    }
	    this._grabbed.classList.remove(this._bem('mh-sortable-ghost'));
	    this._grabbed = null;
	    this._grabbedOffset = null;
	    document.body.removeChild(this._dom.helper);
	    this._dom.helper = null;
	    this.container.classList.remove(this._bem('mh-sortable', null, 'sorting'));
	    return $.dispatch(this.container, this._et('sorted'), {
	      'children': this._dom.children
	    });
	  };

	  Sortable.prototype._grab = function(ev) {
	    var child, grabbed, grabber, helper, i, len, pos, rect, ref;
	    if (ev.type.toLowerCase() === 'mousedown' && !(ev.which === 1)) {
	      return;
	    }
	    grabbed = null;
	    ref = this._dom.children;
	    for (i = 0, len = ref.length; i < len; i++) {
	      child = ref[i];
	      grabber = this.constructor.behaviours.grabber[this._behaviours.grabber];
	      if (grabber(this, child).contains(ev.target)) {
	        grabbed = child;
	        break;
	      }
	    }
	    if (grabbed) {
	      ev.preventDefault();
	      this._grabbed = grabbed;
	      pos = this._getEventPos(ev);
	      rect = this._grabbed.getBoundingClientRect();
	      this._grabbedOffset = [pos[0] - rect.left, pos[1] - rect.top];
	      helper = this.constructor.behaviours.helper[this._behaviours.helper];
	      this._dom.helper = helper(this, this._grabbed);
	      document.body.appendChild(this._dom.helper);
	      this._dom.helper.style.left = (pos[0] - this._grabbedOffset[0]) + "px";
	      this._dom.helper.style.top = (pos[1] - this._grabbedOffset[1]) + "px";
	      this._grabbed.classList.add(this._bem('mh-sortable-ghost'));
	      this.container.classList.add(this._bem('mh-sortable', null, 'sorting'));
	      return $.dispatch(this.container, this._et('grabbed'), {
	        'child': grabbed
	      });
	    }
	  };

	  Sortable.behaviours = {
	    before: {
	      'auto': function(sortable, sibling, pos) {
	        var axis, child, i, len, ref, top, topTable, width;
	        width = sortable.container.getBoundingClientRect().width;
	        if (sortable._containerWidth !== width) {
	          sortable.axis = 'vertical';
	          topTable = {};
	          ref = sortable._dom.children;
	          for (i = 0, len = ref.length; i < len; i++) {
	            child = ref[i];
	            top = child.getBoundingClientRect().top;
	            if (topTable[top]) {
	              sortable.axis = 'horizontal';
	              break;
	            }
	            topTable[top] = true;
	          }
	          sortable._containerWidth = width;
	        }
	        axis = sortable.constructor.behaviours.before['axis'];
	        return axis(sortable, sibling, pos);
	      },
	      'axis': function(sortable, sibling, pos) {
	        var overlap, rect;
	        rect = sibling.getBoundingClientRect();
	        overlap = [pos[0] - rect.left, pos[1] - rect.top];
	        if (sortable.axis === 'vertical') {
	          return overlap[1] < (rect.height / 2);
	        }
	        return overlap[0] < (rect.width / 2);
	      }
	    },
	    children: {
	      'children': function(sortable) {
	        var children, e, elementType;
	        children = sortable.container.childNodes;
	        elementType = 1;
	        return (function() {
	          var i, len, results;
	          results = [];
	          for (i = 0, len = children.length; i < len; i++) {
	            e = children[i];
	            if (e.nodeType === elementType) {
	              results.push(e);
	            }
	          }
	          return results;
	        })();
	      },
	      'selector': function(sortable) {
	        return $.many(sortable.childSelector, sortable.container);
	      }
	    },
	    grabber: {
	      'selector': function(sortable, elm) {
	        return $.one(sortable.grabSelector, elm);
	      },
	      'self': function(sortable, elm) {
	        return elm;
	      }
	    },
	    helper: {
	      'clone': function(sortable, elm) {
	        var cloned, css;
	        cloned = elm.cloneNode(true);
	        cloned.removeAttribute('id');
	        cloned.removeAttribute('name');
	        css = document.defaultView.getComputedStyle(elm, '').cssText;
	        cloned.style.cssText = css;
	        cloned.style.position = 'absolute';
	        cloned.style['pointer-events'] = 'none';
	        cloned.classList.add(sortable._bem('mh-sortable-helper'));
	        return cloned;
	      }
	    }
	  };

	  return Sortable;

	})();

	module.exports = {
	  Sortable: Sortable
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["ManhattanEssentials"] = factory();
		else
			root["ManhattanEssentials"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;

	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};

	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;

	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		module.exports = __webpack_require__(1);


	/***/ },
	/* 1 */
	/***/ function(module, exports) {

		var config, create, dispatch, escapeRegExp, ignore, listen, many, one,
		  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

		create = function(tag, props) {
		  var element, k, v;
		  if (props == null) {
		    props = {};
		  }
		  element = document.createElement(tag);
		  for (k in props) {
		    v = props[k];
		    if ((indexOf.call(element, k) >= 0)) {
		      element[k] = v;
		    } else {
		      element.setAttribute(k, v);
		    }
		  }
		  return element;
		};

		many = function(selectors, container) {
		  if (container == null) {
		    container = document;
		  }
		  return Array.prototype.slice.call(container.querySelectorAll(selectors));
		};

		one = function(selectors, container) {
		  if (container == null) {
		    container = document;
		  }
		  return container.querySelector(selectors);
		};

		dispatch = function(element, eventType, props) {
		  var event, k, v;
		  if (props == null) {
		    props = {};
		  }
		  event = document.createEvent('Event');
		  event.initEvent(eventType, true, true);
		  for (k in props) {
		    v = props[k];
		    event[k] = v;
		  }
		  return element.dispatchEvent(event);
		};

		ignore = function(element, listeners) {
		  var eventType, eventTypes, func, results;
		  results = [];
		  for (eventTypes in listeners) {
		    func = listeners[eventTypes];
		    results.push((function() {
		      var i, len, ref, results1;
		      ref = eventTypes.split(/\s+/);
		      results1 = [];
		      for (i = 0, len = ref.length; i < len; i++) {
		        eventType = ref[i];
		        results1.push(element.removeEventListener(eventType, func));
		      }
		      return results1;
		    })());
		  }
		  return results;
		};

		listen = function(element, listeners) {
		  var eventType, eventTypes, func, results;
		  results = [];
		  for (eventTypes in listeners) {
		    func = listeners[eventTypes];
		    results.push((function() {
		      var i, len, ref, results1;
		      ref = eventTypes.split(/\s+/);
		      results1 = [];
		      for (i = 0, len = ref.length; i < len; i++) {
		        eventType = ref[i];
		        results1.push(element.addEventListener(eventType, func));
		      }
		      return results1;
		    })());
		  }
		  return results;
		};

		config = function(inst, props, args, element, prefix) {
		  var attr, k, results, v;
		  if (prefix == null) {
		    prefix = 'data-';
		  }
		  results = [];
		  for (k in props) {
		    v = props[k];
		    inst[k] = v;
		    if (args.hasOwnProperty(k)) {
		      inst[k] = args[k];
		    }
		    attr = prefix + k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
		    if (element.hasAttribute(attr)) {
		      if (typeof v === 'number') {
		        results.push(inst[k] = parseInt(element.getAttribute(attr)));
		      } else if (v === false) {
		        results.push(inst[k] = true);
		      } else {
		        results.push(inst[k] = element.getAttribute(attr));
		      }
		    } else {
		      results.push(void 0);
		    }
		  }
		  return results;
		};

		escapeRegExp = function(s) {
		  return s.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, '\\$&');
		};

		module.exports = {
		  create: create,
		  one: one,
		  many: many,
		  dispatch: dispatch,
		  ignore: ignore,
		  listen: listen,
		  config: config,
		  escapeRegExp: escapeRegExp
		};


	/***/ }
	/******/ ])
	});
	;

/***/ }
/******/ ])
});
;