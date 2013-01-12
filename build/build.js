

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-to-function/index.js", Function("exports, require, module",
"\n/**\n * Expose `toFunction()`.\n */\n\nmodule.exports = toFunction;\n\n/**\n * Convert `obj` to a `Function`.\n *\n * @param {Mixed} obj\n * @return {Function}\n * @api private\n */\n\nfunction toFunction(obj) {\n  switch ({}.toString.call(obj)) {\n    case '[object Object]':\n      return objectToFunction(obj);\n    case '[object Function]':\n      return obj;\n    case '[object String]':\n      return stringToFunction(obj);\n    case '[object RegExp]':\n      return regexpToFunction(obj);\n    default:\n      return defaultToFunction(obj);\n  }\n}\n\n/**\n * Default to strict equality.\n *\n * @param {Mixed} val\n * @return {Function}\n * @api private\n */\n\nfunction defaultToFunction(val) {\n  return function(obj){\n    return val === obj;\n  }\n}\n\n/**\n * Convert `re` to a function.\n *\n * @param {RegExp} re\n * @return {Function}\n * @api private\n */\n\nfunction regexpToFunction(re) {\n  return function(obj){\n    return re.test(obj);\n  }\n}\n\n/**\n * Convert property `str` to a function.\n *\n * @param {String} str\n * @return {Function}\n * @api private\n */\n\nfunction stringToFunction(str) {\n  // immediate such as \"> 20\"\n  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\n  // properties such as \"name.first\" or \"age > 18\"\n  return new Function('_', 'return _.' + str);\n}\n\n/**\n * Convert `object` to a function.\n *\n * @param {Object} object\n * @return {Function}\n * @api private\n */\n\nfunction objectToFunction(obj) {\n  var match = {}\n  for (var key in obj) {\n    match[key] = typeof obj[key] === 'string'\n      ? defaultToFunction(obj[key])\n      : toFunction(obj[key])\n  }\n  return function(val){\n    if (typeof val !== 'object') return false;\n    for (var key in match) {\n      if (!(key in val)) return false;\n      if (!match[key](val[key])) return false;\n    }\n    return true;\n  }\n}\n//@ sourceURL=component-to-function/index.js"
));
require.register("component-max/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar toFunction = require('to-function');\n\n/**\n * Return the max value in `arr` with optional callback `fn(val, i)`.\n *\n * @param {Array} arr\n * @param {Function} [fn]\n * @return {Number}\n * @api public\n */\n\nmodule.exports = function(arr, fn){\n  var max = -Infinity;\n\n  if (fn) {\n    fn = toFunction(fn);\n    for (var i = 0; i < arr.length; ++i) {\n      var ret = fn(arr[i], i);\n      max = ret > max\n        ? ret\n        : max;\n    }\n  } else {\n    for (var i = 0; i < arr.length; ++i) {\n      max = arr[i] > max\n        ? arr[i]\n        : max;\n    }\n  }\n\n  return max;\n};//@ sourceURL=component-max/index.js"
));
require.register("component-autoscale-canvas/index.js", Function("exports, require, module",
"\n/**\n * Retina-enable the given `canvas`.\n *\n * @param {Canvas} canvas\n * @return {Canvas}\n * @api public\n */\n\nmodule.exports = function(canvas){\n  var ctx = canvas.getContext('2d');\n  var ratio = window.devicePixelRatio || 1;\n  if (1 != ratio) {\n    canvas.style.width = canvas.width + 'px';\n    canvas.style.height = canvas.height + 'px';\n    canvas.width *= ratio;\n    canvas.height *= ratio;\n    ctx.scale(ratio, ratio);\n  }\n  return canvas;\n};//@ sourceURL=component-autoscale-canvas/index.js"
));
require.register("component-style/index.js", Function("exports, require, module",
"\n/**\n * Expose `style`.\n */\n\nmodule.exports = style;\n\n/**\n * Return the style for `prop` using the given `selector`.\n *\n * @param {String} selector\n * @param {String} prop\n * @return {String}\n * @api public\n */\n\nfunction style(selector, prop) {\n  var cache = style.cache = style.cache || {}\n    , cid = selector + ':' + prop;\n\n  if (cache[cid]) return cache[cid];\n\n  var parts = selector.split(/ +/)\n    , len = parts.length\n    , parent = document.createElement('div')\n    , root = parent\n    , child\n    , part;\n\n  for (var i = 0; i < len; ++i) {\n    part = parts[i];\n    child = document.createElement('div');\n    parent.appendChild(child);\n    parent = child;\n    if ('#' == part[0]) {\n      child.setAttribute('id', part.substr(1));\n    } else if ('.' == part[0]) {\n      child.setAttribute('class', part.substr(1));\n    }\n  }\n\n  document.body.appendChild(root);\n  var ret = getComputedStyle(child)[prop];\n  document.body.removeChild(root);\n  return cache[cid] = ret;\n}//@ sourceURL=component-style/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = callbacks.indexOf(fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("component-file/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar file = require('./file')\n  , reader = require('./reader');\n\n/**\n * Expose `file()`.\n */\n\nexports = module.exports = file;\n\n/**\n * Expose `reader()`.\n */\n\nexports.reader = reader;//@ sourceURL=component-file/index.js"
));
require.register("component-file/file.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar Emitter = require('emitter')\n  , Reader = require('./reader');\n\n/**\n * Expose `file()`.\n */\n\nmodule.exports = file;\n\n/**\n * Initialize a new `File` wrapping `file`.\n *\n * @param {File} file\n * @return {File}\n * @api public\n */\n\nfunction file(file) {\n  return new File(file);\n}\n\n/**\n * Initialize a new `File` wrapper.\n *\n * @param {File} file\n * @api private\n */\n\nfunction File(file) {\n  Emitter.call(this);\n  this.file = file;\n  for (var key in file) this[key] = file[key];\n}\n\n/**\n * Inherits from `Emitter.prototype`.\n */\n\nFile.prototype.__proto__ = Emitter.prototype;\n\n/**\n * Check if the mime type matches `type`.\n *\n * Examples:\n *\n *    file.is('image/jpeg')\n *    file.is('image/*')\n *\n * @param {String} type\n * @return {Boolean}\n * @api public\n */\n\nFile.prototype.is = function(type){\n  var real = this.file.type;\n\n  // identical\n  if (type == real) return true;\n\n  real = real.split('/');\n  type = type.split('/');\n\n  // type/*\n  if (type[0] == real[0] && type[1] == '*') return true;\n\n  // */subtype\n  if (type[1] == real[1] && type[0] == '*') return true;\n\n  return false;\n};\n\n/**\n * Convert to `type` and invoke `fn(err, result)`.\n *\n * @param {String} type\n * @param {Function} fn\n * @return {Reader}\n * @api private\n */\n\nFile.prototype.to = function(type, fn){\n  var reader = Reader();\n  reader.on('error', fn);\n  reader.on('end', function(res){ fn(null, res) });\n  reader.read(this.file, type);\n  return reader;\n};\n\n/**\n * Convert to an `ArrayBuffer`.\n *\n * @param {Function} fn\n * @return {Reader}\n * @api public\n */\n\nFile.prototype.toArrayBuffer = function(fn){\n  return this.to('ArrayBuffer', fn);\n};\n\n/**\n * Convert to text.\n *\n * @param {Function} fn\n * @return {Reader}\n * @api public\n */\n\nFile.prototype.toText = function(fn){\n  // TODO: encoding\n  return this.to('Text', fn);\n};\n\n/**\n * Convert to a data uri.\n *\n * @param {Function} fn\n * @return {Reader}\n * @api public\n */\n\nFile.prototype.toDataURL = function(fn){\n  return this.to('DataURL', fn);\n};\n//@ sourceURL=component-file/file.js"
));
require.register("component-file/reader.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar Emitter = require('emitter');\n\n/**\n * Expose `reader()`.\n */\n\nmodule.exports = reader;\n\n/**\n * Initialize a new `Reader` from optional `reader`\n * or a new `FileReader` is created.\n *\n * @param {FileReader} reader\n * @return {Reader}\n * @api public\n */\n\nfunction reader(reader) {\n  return reader\n    ? new Reader(reader)\n    : new Reader(new FileReader);\n}\n\n/**\n * Initialize a new `Reader`, a wrapper\n * around a `FileReader`.\n *\n * Emits:\n *\n *   - `error` an error occurred\n *   - `progress` in progress (`e.percent` etc)\n *   - `end` read is complete\n *\n * @param {FileReader} reader\n * @api private\n */\n\nfunction Reader(reader) {\n  Emitter.call(this);\n  this.reader = reader;\n  reader.onerror = this.emit.bind(this, 'error');\n  reader.onabort = this.emit.bind(this, 'error', new Error('abort'));\n  reader.onprogress = this.onprogress.bind(this);\n  reader.onload = this.onload.bind(this);\n}\n\n/**\n * Inherits from `Emitter.prototype`.\n */\n\nReader.prototype.__proto__ = Emitter.prototype;\n\n/**\n * Onload handler.\n * \n * @api private\n */\n\nReader.prototype.onload = function(e){\n  this.emit('end', this.reader.result);\n};\n\n/**\n * Progress handler.\n * \n * @api private\n */\n\nReader.prototype.onprogress = function(e){\n  e.percent = e.loaded / e.total * 100 | 0;\n  this.emit('progress', e);\n};\n\n/**\n * Abort.\n *\n * @api public\n */\n\nReader.prototype.abort = function(){\n  this.reader.abort();\n};\n\n/**\n * Read `file` as `type`.\n *\n * @param {File} file\n * @param {String} type\n * @api private\n */\n\nReader.prototype.read = function(file, type){\n  var method = 'readAs' + type;\n  this.reader[method](file);\n};\n\n//@ sourceURL=component-file/reader.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Whitespace regexp.\n */\n\nvar re = /\\s+/;\n\n/**\n * Wrap `el` in a `ClassList`.\n *\n * @param {Element} el\n * @return {ClassList}\n * @api public\n */\n\nmodule.exports = function(el){\n  return new ClassList(el);\n};\n\n/**\n * Initialize a new ClassList for `el`.\n *\n * @param {Element} el\n * @api private\n */\n\nfunction ClassList(el) {\n  this.el = el;\n  this.list = el.classList;\n}\n\n/**\n * Add class `name` if not already present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.add = function(name){\n  // classList\n  if (this.list) {\n    this.list.add(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (!~i) arr.push(name);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove class `name` when present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.remove = function(name){\n  // classList\n  if (this.list) {\n    this.list.remove(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (~i) arr.splice(i, 1);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Toggle class `name`.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.toggle = function(name){\n  // classList\n  if (this.list) {\n    this.list.toggle(name);\n    return this;\n  }\n\n  // fallback\n  if (this.has(name)) {\n    this.remove(name);\n  } else {\n    this.add(name);\n  }\n  return this;\n};\n\n/**\n * Return an array of classes.\n *\n * @return {Array}\n * @api public\n */\n\nClassList.prototype.array = function(){\n  var arr = this.el.className.split(re);\n  if ('' === arr[0]) arr.pop();\n  return arr;\n};\n\n/**\n * Check if class `name` is present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.has =\nClassList.prototype.contains = function(name){\n  return this.list\n    ? this.list.contains(name)\n    : !! ~index(this.array(), name);\n};\n//@ sourceURL=component-classes/index.js"
));
require.register("component-upload/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar Emitter = require('emitter');\n\n/**\n * Expose `Upload`.\n */\n\nmodule.exports = Upload;\n\n/**\n * Initialize a new `Upload` file`.\n * This represents a single file upload.\n *\n * Events:\n *\n *   - `error` an error occurred\n *   - `abort` upload was aborted\n *   - `progress` upload in progress (`e.percent` etc)\n *   - `end` upload is complete\n *\n * @param {File} file\n * @api private\n */\n\nfunction Upload(file) {\n  if (!(this instanceof Upload)) return new Upload(file);\n  Emitter.call(this);\n  this.file = file;\n}\n\n/**\n * Mixin emitter.\n */\n\nEmitter(Upload.prototype);\n\n/**\n * Upload to the given `path`.\n *\n * @param {String} path\n * @api public\n */\n\nUpload.prototype.to = function(path){\n  // TODO: x-browser\n  var req = this.req = new XMLHttpRequest;\n  req.open('POST', path);\n  req.onload = this.onload.bind(this);\n  req.onerror = this.onerror.bind(this);\n  req.upload.onprogress = this.onprogress.bind(this);\n  var body = new FormData;\n  body.append('file', this.file);\n  req.send(body);\n};\n\n/**\n * Abort the XHR.\n *\n * @api public\n */\n\nUpload.prototype.abort = function(){\n  this.emit('abort');\n  this.req.abort();\n};\n\n/**\n * Error handler.\n *\n * @api private\n */\n\nUpload.prototype.onerror = function(e){\n  this.emit('error', e);\n};\n\n/**\n * Onload handler.\n *\n * @api private\n */\n\nUpload.prototype.onload = function(e){\n  this.emit('end', this.req);\n};\n\n/**\n * Progress handler.\n *\n * @api private\n */\n\nUpload.prototype.onprogress = function(e){\n  e.percent = e.loaded / e.total * 100;\n  this.emit('progress', e);\n};\n//@ sourceURL=component-upload/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  if (el.addEventListener) {\n    el.addEventListener(type, fn, capture);\n  } else {\n    el.attachEvent('on' + type, fn);\n  }\n  return fn;\n};\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  if (el.removeEventListener) {\n    el.removeEventListener(type, fn, capture);\n  } else {\n    el.detachEvent('on' + type, fn);\n  }\n  return fn;\n};\n//@ sourceURL=component-event/index.js"
));
require.register("component-event-manager/index.js", Function("exports, require, module",
"\n\n/**\n * Expose `EventManager`.\n */\n\nmodule.exports = EventManager;\n\n/**\n * Initialize an `EventManager` with the given\n * `target` object which events will be bound to,\n * and the `obj` which will receive method calls.\n *\n * @param {Object} target\n * @param {Object} obj\n * @api public\n */\n\nfunction EventManager(target, obj) {\n  this.target = target;\n  this.obj = obj;\n  this._bindings = {};\n}\n\n/**\n * Register bind function.\n *\n * @param {Function} fn\n * @return {EventManager} self\n * @api public\n */\n\nEventManager.prototype.onbind = function(fn){\n  this._bind = fn;\n  return this;\n};\n\n/**\n * Register unbind function.\n *\n * @param {Function} fn\n * @return {EventManager} self\n * @api public\n */\n\nEventManager.prototype.onunbind = function(fn){\n  this._unbind = fn;\n  return this;\n};\n\n/**\n * Bind to `event` with optional `method` name.\n * When `method` is undefined it becomes `event`\n * with the \"on\" prefix.\n *\n *    events.bind('login') // implies \"onlogin\"\n *    events.bind('login', 'onLogin')\n *\n * @param {String} event\n * @param {String} [method]\n * @return {Function} callback\n * @api public\n */\n\nEventManager.prototype.bind = function(event, method){\n  var fn = this.addBinding.apply(this, arguments);\n  if (this._onbind) this._onbind(event, method, fn);\n  this._bind(event, fn);\n  return fn;\n};\n\n/**\n * Add event binding.\n *\n * @param {String} event\n * @param {String} method\n * @return {Function} callback\n * @api private\n */\n\nEventManager.prototype.addBinding = function(event, method){\n  var obj = this.obj;\n  var method = method || 'on' + event;\n  var args = [].slice.call(arguments, 2);\n\n  // callback\n  function callback() {\n    var a = [].slice.call(arguments).concat(args);\n    obj[method].apply(obj, a);\n  }\n\n  // subscription\n  this._bindings[event] = this._bindings[event] || {};\n  this._bindings[event][method] = callback;\n\n  return callback;\n};\n\n/**\n * Unbind a single binding, all bindings for `event`,\n * or all bindings within the manager.\n *\n *     evennts.unbind('login', 'onLogin')\n *     evennts.unbind('login')\n *     evennts.unbind()\n *\n * @param {String} [event]\n * @param {String} [method]\n * @return {Function} callback\n * @api public\n */\n\nEventManager.prototype.unbind = function(event, method){\n  if (0 == arguments.length) return this.unbindAll();\n  if (1 == arguments.length) return this.unbindAllOf(event);\n  var fn = this._bindings[event][method];\n  if (this._onunbind) this._onunbind(event, method, fn);\n  this._unbind(event, fn);\n  return fn;\n};\n\n/**\n * Unbind all events.\n *\n * @api private\n */\n\nEventManager.prototype.unbindAll = function(){\n  for (var event in this._bindings) {\n    this.unbindAllOf(event);\n  }\n};\n\n/**\n * Unbind all events for `event`.\n *\n * @param {String} event\n * @api private\n */\n\nEventManager.prototype.unbindAllOf = function(event){\n  var bindings = this._bindings[event];\n  if (!bindings) return;\n  for (var method in bindings) {\n    this.unbind(event, method);\n  }\n};\n//@ sourceURL=component-event-manager/index.js"
));
require.register("component-events/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar Manager = require('event-manager')\n  , event = require('event');\n\n/**\n * Return a new event manager.\n */\n\nmodule.exports = function(target, obj){\n  var manager = new Manager(target, obj);\n\n  manager.onbind(function(name, fn){\n    event.bind(target, name, fn);\n  });\n\n  manager.onunbind(function(name, fn){\n    event.unbind(target, name, fn);\n  });\n\n  return manager;\n};\n//@ sourceURL=component-events/index.js"
));
require.register("component-dropload/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar Emitter = require('emitter')\n  , classes = require('classes')\n  , Upload = require('upload')\n  , events = require('events')\n\n/**\n * Expose `Dropload`.\n */\n\nmodule.exports = Dropload;\n\n/**\n * Initialize a drop point\n * on the given `el`.\n *\n * Emits:\n *\n *   - `error` on validation error\n *   - `upload` passing an `Upload`\n *\n * @param {Element} el\n * @api public\n */\n\nfunction Dropload(el) {\n  if (!(this instanceof Dropload)) return new Dropload(el);\n  Emitter.call(this);\n  this.el = el;\n  this.classes = classes(el);\n  this.events = events(el, this);\n  this.events.bind('drop');\n  this.events.bind('dragenter');\n  this.events.bind('dragleave');\n  this.events.bind('dragover');\n}\n\n/**\n * Mixin emitter.\n */\n\nEmitter(Dropload.prototype);\n\n/**\n * Unbind event handlers.\n *\n * @api public\n */\n\nDropload.prototype.unbind = function(){\n  this.events.unbind();\n};\n\n/**\n * Dragenter handler.\n */\n\nDropload.prototype.ondragenter = function(e){\n  this.classes.add('over');\n};\n\n/**\n * Dragover handler.\n */\n\nDropload.prototype.ondragover = function(e){\n  e.preventDefault();\n};\n\n/**\n * Dragleave handler.\n */\n\nDropload.prototype.ondragleave = function(e){\n  this.classes.remove('over');\n};\n\n/**\n * Drop handler.\n */\n\nDropload.prototype.ondrop = function(e){\n  e.stopPropagation();\n  e.preventDefault();\n  this.classes.remove('over');\n  this.upload(e.dataTransfer.files);\n};\n\n/**\n * Upload the given `files`.\n *\n * Presents each `file` in the FileList\n * as an `Upload` via the \"upload\" event\n * after it has been validated.\n *\n * @param {FileList} files\n * @api public\n */\n\nDropload.prototype.upload = function(files){\n  for (var i = 0, len = files.length; i < len; ++i) {\n    this.emit('upload', new Upload(files[i]));\n  }\n};\n//@ sourceURL=component-dropload/index.js"
));
require.register("histogram/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar max = require('max')\n  , style = require('style')\n  , ratio = window.devicePixelRatio || 1;\n\n/**\n * Expose `Histogram`.\n */\n\nmodule.exports = Histogram;\n\n/**\n * Initialize a new Histogram with the given reference `img`.\n *\n * @param {Image} img\n * @api public\n */\n\nfunction Histogram(img) {\n  if (!(this instanceof Histogram)) return new Histogram(img);\n  this.img = img;\n  this.bg = style('.histogram', 'background-color');\n  this.opacity = style('.histogram .channel', 'opacity');\n  this.rcolor = style('.histogram .red', 'color');\n  this.gcolor = style('.histogram .green', 'color');\n  this.bcolor = style('.histogram .blue', 'color');\n}\n\n/**\n * Set smooth kernel `size`, when invoked\n * without a value the default of 6 is used.\n *\n * @param {Number} [size]\n * @return {Histogram} self\n * @api public\n */\n\nHistogram.prototype.smooth = function(size){\n  switch (arguments.length) {\n    case 0:\n      this._smooth = 6;\n      break;\n    default:\n      this._smooth = size;\n  }\n\n  return this;\n};\n\n/**\n * Draw the histogram on the given `canvas`.\n *\n * @param {Canvas} canvas\n * @api public\n */\n\nHistogram.prototype.draw = function(canvas){\n  this.canvas = canvas;\n  var w = canvas.width;\n  var h = canvas.height;\n  var ctx = canvas.getContext('2d');\n  var data = this.histogram();\n\n  var rm = max(data.r);\n  var gm = max(data.g);\n  var bm = max(data.b);\n  var m = max([rm, gm, bm]);\n\n  if (2 == ratio) ctx.scale(.5, .5);\n\n  this.barWidth = w / 256;\n\n  ctx.fillStyle = this.bg;\n  ctx.fillRect(0, 0, w, h);\n\n  ctx.fillStyle = ctx.strokeStyle = this.rcolor;\n  this.drawColor(ctx, data.r, m);\n\n  ctx.fillStyle = ctx.strokeStyle = this.gcolor;\n  this.drawColor(ctx, data.g, m);\n\n  ctx.fillStyle = ctx.strokeStyle = this.bcolor;\n  this.drawColor(ctx, data.b, m);\n};\n\n/**\n * Plot a color range.\n *\n * @api private\n */\n\nHistogram.prototype.drawColor = function(ctx, data, m){\n  var w = this.canvas.width;\n  var h = this.canvas.height;\n  var bw = this.barWidth;\n  var x = 0;\n\n  ctx.beginPath();\n  ctx.globalAlpha = this.opacity;\n  ctx.moveTo(0, h);\n\n  for (var i = 0; i < data.length; i++) {\n    var d = data[i];\n    if (this._smooth) d = this.smoothData(data, i);\n    var bh = h - h * (d / m);\n    ctx.lineTo(x += bw, bh);\n  }\n\n  ctx.lineTo(x, h);\n  ctx.fill();\n  ctx.globalAlpha = 1;\n  ctx.stroke();\n};\n\n/**\n * Smooth the dataset.\n *\n * @api private\n */\n\nHistogram.prototype.smoothData = function(data, i){\n  var k = this._smooth / 2;\n  var d = data[i];\n  for (var j = 0; j < k; j++) d += data[i - j] || 0;\n  for (var j = 0; j < k; j++) d += data[i + j] || 0;\n  return d / (this._smooth + 1);\n};\n\n/**\n * Compute histogram data.\n *\n * @return {Object}\n * @api private\n */\n\nHistogram.prototype.histogram = function(){\n  var id = this.imageData();\n  var pixels = id.data;\n  var sensivity = 10000;\n\n  var ret = {};\n  ret.r = new Array(256);\n  ret.g = new Array(256);\n  ret.b = new Array(256);\n\n  // zero\n  for (var i = 0; i < 256; i++) {\n    ret.r[i] = 0;\n    ret.g[i] = 0;\n    ret.b[i] = 0;\n  }\n\n  // fill\n  for (var i = 0; i < pixels.length; i += 4) {\n    var r = pixels[i];\n    var g = pixels[i + 1];\n    var b = pixels[i + 2];\n    if (ret.r[r] < sensivity) ret.r[r]++;\n    if (ret.g[g] < sensivity) ret.g[g]++;\n    if (ret.b[b] < sensivity) ret.b[b]++;\n  }\n\n  return ret;\n};\n\n/**\n * Return image data.\n *\n * @return {ImageData}\n * @api private\n */\n\nHistogram.prototype.imageData = function(){\n  var canvas = this.imageCanvas();\n  var ctx = canvas.getContext('2d');\n  return ctx.getImageData(0, 0, canvas.width, canvas.height);\n};\n\n/**\n * Create the image Canvas.\n *\n * TODO: Draw to histogram canvas and sample from there?\n * since we dont need the resolution this should be relative.\n *\n * @return {Canvas}\n * @api private\n */\n\nHistogram.prototype.imageCanvas = function(){\n  var img = this.img;\n  var canvas = document.createElement('canvas');\n  canvas.width = img.width;\n  canvas.height = img.height;\n  var ctx = canvas.getContext('2d');\n  ctx.drawImage(img, 0, 0);\n  return canvas;\n};\n//@ sourceURL=histogram/index.js"
));
require.alias("component-max/index.js", "histogram/deps/max/index.js");
require.alias("component-to-function/index.js", "component-max/deps/to-function/index.js");

require.alias("component-autoscale-canvas/index.js", "histogram/deps/autoscale-canvas/index.js");

require.alias("component-style/index.js", "histogram/deps/style/index.js");

require.alias("component-file/index.js", "histogram/deps/file/index.js");
require.alias("component-file/file.js", "histogram/deps/file/file.js");
require.alias("component-file/reader.js", "histogram/deps/file/reader.js");
require.alias("component-emitter/index.js", "component-file/deps/emitter/index.js");

require.alias("component-dropload/index.js", "histogram/deps/dropload/index.js");
require.alias("component-emitter/index.js", "component-dropload/deps/emitter/index.js");

require.alias("component-classes/index.js", "component-dropload/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-upload/index.js", "component-dropload/deps/upload/index.js");
require.alias("component-emitter/index.js", "component-upload/deps/emitter/index.js");

require.alias("component-events/index.js", "component-dropload/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-event-manager/index.js", "component-events/deps/event-manager/index.js");

