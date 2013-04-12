
/**
 * Module dependencies.
 */

var max = require('max')
  , style = require('style')
  , ratio = window.devicePixelRatio || 1;

/**
 * Expose `Histogram`.
 */

module.exports = Histogram;

/**
 * Initialize a new Histogram with the given reference `img`.
 *
 * @param {Image} img
 * @api public
 */

function Histogram(img) {
  if (!(this instanceof Histogram)) return new Histogram(img);
  this.img = img;
  this.bg = style('.histogram', 'background-color');
  this.borderColor = style('.histogram', 'border-color');
  this.opacity = style('.histogram .channel', 'opacity');
  this.rcolor = style('.histogram .red', 'color');
  this.gcolor = style('.histogram .green', 'color');
  this.bcolor = style('.histogram .blue', 'color');
}

/**
 * Set smooth kernel `size`, when invoked
 * without a value the default of 6 is used.
 *
 * @param {Number} [size]
 * @return {Histogram} self
 * @api public
 */

Histogram.prototype.smooth = function(size){
  switch (arguments.length) {
    case 0:
      this._smooth = 6;
      break;
    default:
      this._smooth = size;
  }

  return this;
};

/**
 * Draw the histogram on the given `canvas`.
 *
 * @param {Canvas} canvas
 * @api public
 */

Histogram.prototype.draw = function(canvas){
  this.canvas = canvas;
  var w = canvas.width;
  var h = canvas.height;
  var ctx = canvas.getContext('2d');
  var data = this.histogram();

  var rm = max(data.r);
  var gm = max(data.g);
  var bm = max(data.b);
  var m = max([rm, gm, bm]);

  if (2 == ratio) ctx.scale(.5, .5);

  this.barWidth = w / 256;

  ctx.fillStyle = this.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = ctx.strokeStyle = this.rcolor;
  this.drawColor(ctx, data.r, m);

  ctx.fillStyle = ctx.strokeStyle = this.gcolor;
  this.drawColor(ctx, data.g, m);

  ctx.fillStyle = ctx.strokeStyle = this.bcolor;
  this.drawColor(ctx, data.b, m);

  if (!this.borderColor) return;

  ctx.strokeStyle = this.borderColor;
  ctx.beginPath();
  ctx.moveTo(0, h - 15);
  ctx.lineTo(0, h);
  ctx.lineTo(w, h);
  ctx.lineTo(w, h - 15);
  ctx.stroke();
};

/**
 * Plot a color range.
 *
 * @api private
 */

Histogram.prototype.drawColor = function(ctx, data, m){
  var w = this.canvas.width;
  var h = this.canvas.height;
  var bw = this.barWidth;
  var x = 0;

  ctx.beginPath();
  ctx.globalAlpha = this.opacity;
  ctx.moveTo(0, h);

  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    if (this._smooth) d = this.smoothData(data, i);
    var bh = h - h * (d / m);
    ctx.lineTo(x += bw, bh);
  }

  ctx.lineTo(x, h);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();
};

/**
 * Smooth the dataset.
 *
 * @api private
 */

Histogram.prototype.smoothData = function(data, i){
  var k = this._smooth / 2;
  var d = data[i];
  for (var j = 0; j < k; j++) d += data[i - j] || 0;
  for (var j = 0; j < k; j++) d += data[i + j] || 0;
  return d / (this._smooth + 1);
};

/**
 * Compute histogram data.
 *
 * @return {Object}
 * @api private
 */

Histogram.prototype.histogram = function(){
  var id = this.imageData();
  var pixels = id.data;
  var sensivity = 10000;

  var ret = {};
  ret.r = new Array(256);
  ret.g = new Array(256);
  ret.b = new Array(256);

  // zero
  for (var i = 0; i < 256; i++) {
    ret.r[i] = 0;
    ret.g[i] = 0;
    ret.b[i] = 0;
  }

  // fill
  for (var i = 0; i < pixels.length; i += 4) {
    var r = pixels[i];
    var g = pixels[i + 1];
    var b = pixels[i + 2];
    if (ret.r[r] < sensivity) ret.r[r]++;
    if (ret.g[g] < sensivity) ret.g[g]++;
    if (ret.b[b] < sensivity) ret.b[b]++;
  }

  return ret;
};

/**
 * Return image data.
 *
 * @return {ImageData}
 * @api private
 */

Histogram.prototype.imageData = function(){
  var canvas = this.imageCanvas();
  var ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * Create the image Canvas.
 *
 * TODO: Draw to histogram canvas and sample from there?
 * since we dont need the resolution this should be relative.
 *
 * @return {Canvas}
 * @api private
 */

Histogram.prototype.imageCanvas = function(){
  var img = this.img;
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas;
};
