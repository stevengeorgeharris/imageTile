/**
 * Takes an image and builds a photo mosiac
 * @author Steven Harris
 *
 */

var TILE_WIDTH = 16;
var TILE_HEIGHT = 16;

var Mosiac = function() {
  this.handleFileUpload();
};

Mosiac.prototype.handleFileUpload = function() {
  this.uploadButton = document.querySelector('.c-upload');
  var readImage = new FileReader();

  this.uploadButton.addEventListener('change', function() {
    var file = this.files[0];

    if (file) {
      readImage.readAsDataURL(file);
    } else {
      throw new Error('No file');
    }

    readImage.addEventListener('load', function() {
      this.prototype.uploadedImage = readImage.result;
      this.prototype.start();
    }.bind(Mosiac));
  });
};

Mosiac.prototype.start = function() {
  this.createImage();
};

/**
 * A function which creates an image element.
 * @param {string} The uploaded image
 * @return {elemtent} Image
 */

Mosiac.prototype.createImage = function() {
  this.artboard = document.querySelector('.c-paste');
  this.artboardContext = this.artboard.getContext('2d');

  this.image = new Image();
  this.image.addEventListener('load', function() {
    var renderedImage = this.prototype.renderImage();
    this.prototype.splitImage(renderedImage);
  }.bind(Mosiac));
  this.image.src = this.uploadedImage;
};

Mosiac.prototype.renderImage = function() {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = this.image.width;
  canvas.height = this.image.height;
  context.drawImage(this.image, 0, 0, canvas.width, canvas.height);

  return context;
};

Mosiac.prototype.splitImage = function(renderedImage) {
  var width = renderedImage.canvas.width;
  var placeCanvas = document.createElement('canvas');
  var placeContext = placeCanvas.getContext('2d');
  var pixelBlock = 5;
  var imageHeight = (this.image.height / TILE_HEIGHT) | 0;
  var imageWidth = (this.image.width / TILE_WIDTH) | 0;

  var imageData = renderedImage.getImageData(0, 0, renderedImage.canvas.width, renderedImage.canvas.height);
  // placeContext.drawImage(this.image, x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 0, 0, TILE_WIDTH, TILE_HEIGHT);

  for (var i = 0; i < imageHeight; i++) {
    for (var j = 0; j < imageWidth; j++) {
      var x = j * TILE_WIDTH,
        y = i * TILE_HEIGHT;

      var tileData = this.getTileData(x, y, width, imageData);
      var colour = this.getAverageColour(tileData);
      this.getSvgTile(x, y, colour);
    }
  }
};

Mosiac.prototype.getTileData = function(tileX, tileY, width, tileData) {
  var data = [];
  for (var x = tileX; x < (tileX + TILE_WIDTH); x++) {
    var xPos = x * 4;

    for (var y = tileY; y < (tileY + TILE_HEIGHT); y++) {
      var yPos = y * width * 4;
      data.push(
        tileData.data[xPos + yPos + 0],
        tileData.data[xPos + yPos + 1],
        tileData.data[xPos + yPos + 2],
        tileData.data[xPos + yPos + 3]
      );
    }
  }
  return data;
};

Mosiac.prototype.getAverageColour = function(data) {
  var blockSize = 5,
    i = -4,
    length,
    rgb = {
      r: 0,
      g: 0,
      b: 0
    },
    count = 0;

  length = data.length;

  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data[i];
    rgb.g += data[i + 1];
    rgb.b += data[i + 2];
  }

  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  function convertToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  return convertToHex(rgb.r) + convertToHex(rgb.g) + convertToHex(rgb.b);
};

Mosiac.prototype.getSvgTile = function(x, y, colour) {
  var colourReq = new XMLHttpRequest();
  var countX = x;
  var countY = y;
  colourReq.addEventListener("load", function(result) {
    this.prototype.drawSvg(countX, countY, result.target.response);
  }.bind(Mosiac), false);
  colourReq.open("GET", "/color/" + colour);
  colourReq.send();
};

Mosiac.prototype.drawSvg = function(x, y, xhr) {
  svg = xhr;
  svgImage = new Image();
  svgImage.src = "data:image/svg+xml," + svg;
  svgImage.load = this.artboardContext.drawImage(svgImage, x, y);
};

window.onload = new Mosiac();
