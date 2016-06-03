/**
 * Takes an image and builds a photo mosiac
 * @author Steven Harris
 * @version 0.0.1
 *
 */

var Mosiac = function() {
  this.handleFileUpload();
};

Mosiac.prototype.handleFileUpload = function() {
  var uploadButton = document.querySelector('.c-upload');
  var dropZone = document.querySelector('.c-drop');
  var readImage = new FileReader();

  function useImage(tar) {
    var file = tar;

    if (file.type.indexOf('jpeg') !== -1 || file.type.indexOf('png') !== -1) {
      readImage.readAsDataURL(file);
    } else {
      throw new Error('Wrong file type.');
    }

    readImage.addEventListener('load', function() {
      this.prototype.uploadedImage = readImage.result;
      this.prototype.start();
      dropZone.className = dropZone.className.replace(/\bc-drop--static\b/,'c-drop--dropped');
    }.bind(Mosiac));
  }

  dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropZone.className = dropZone.className.replace(/\bc-drop--static\b/,'c-drop--active');
  }, false);

  dropZone.addEventListener('dragend', function(e) {
    e.preventDefault();
    dropZone.className = dropZone.className.replace(/\bc-drop--active\b/,'c-drop--static');
  }, false);

  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropZone.className = dropZone.className.replace(/\bc-drop--active\b/,'c-drop--dropped');
    useImage(e.dataTransfer.files[0]);
  }, false);

  uploadButton.addEventListener('change', function() {
    useImage(this.files[0]);
  });
};

Mosiac.prototype.start = function() {
  this.createImage();
  this.downloadCanvas();
};

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
  var renderHeight,
    renderWidth;

  // Handle large images.
  if (this.image.width >= 500) {
    this.resize = 500;
    this.artboard.width = this.resize;
    this.artboard.height = this.image.height * (this.resize / this.image.width);
    canvas.width = this.resize;
    canvas.height = ~~(this.image.height * (this.resize / this.image.width));

    renderHeight = ~~(this.image.height * (this.resize / this.image.width));
    renderWidth = this.resize;
  } else {
    renderHeight = this.image.height;
    renderWidth = this.image.width;
  }

  canvas.height = renderHeight;
  canvas.width = renderWidth;

  context.drawImage(this.image, 0, 0, renderWidth, renderHeight);

  return context;
};

Mosiac.prototype.splitImage = function(renderedImage) {
  var width = renderedImage.canvas.width;
  var imageHeight = (this.image.height / TILE_HEIGHT) | 0;
  var imageWidth = (this.image.width / TILE_WIDTH) | 0;

  var imageData = renderedImage.getImageData(0, 0, renderedImage.canvas.width, renderedImage.canvas.height);

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
  var tileSize = 5,
    i = -4,
    length,
    rgb = {
      r: 0,
      g: 0,
      b: 0
    },
    count = 0;

  length = data.length;

  while ((i += tileSize * 4) < length) {
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
    return hex.length == 1 ? '0' + hex : hex;
  }

  return convertToHex(rgb.r) + convertToHex(rgb.g) + convertToHex(rgb.b);
};

Mosiac.prototype.getSvgTile = function(x, y, colour) {
  var colourReq = new XMLHttpRequest();
  var countX = x;
  var countY = y;
  colourReq.addEventListener('load', function(result) {
    this.prototype.drawSvg(countX, countY, result.target.response);
  }.bind(Mosiac), false);
  colourReq.open('GET', '/color/' + colour);
  colourReq.send();
};

Mosiac.prototype.drawSvg = function(x, y, xhr) {
  var svg = xhr;
  var svgImage = new Image();
  svgImage.src = 'data:image/svg+xml,' + svg;
  svgImage.onload = this.artboardContext.drawImage(svgImage, x, y);
};

Mosiac.prototype.downloadCanvas = function() {
  var canvas =  document.querySelector('.c-paste');
  var link = document.querySelector('.c-canvas-download');

  function updateLink(link, filename) {
    link.href = canvas.toDataURL();
    link.download = filename;
  }

  link.addEventListener('click', function() {
    updateLink(this, 'mosiac.jpg');
  });
};

window.onload = new Mosiac();
