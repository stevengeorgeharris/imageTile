var canva = canva || {};

canva.handleFile = {
  init: function() {
    this.attach();
  },
  attach: function() {
    var preview = document.querySelector('.c-preview');
    var upload = document.querySelector('.c-upload');
    var artboard = document.querySelector('.c-paste');
    var readImage = new FileReader();
    var xCount = 0, yCount = 0;

    upload.addEventListener('change', function() {
      var file = this.files[0];

      if (file) {
        readImage.readAsDataURL(file);
      }

      readImage.addEventListener("load", function () {
        var imageBase = readImage.result;
        var sliceWidth = TILE_WIDTH;
        var sliceHeight = TILE_HEIGHT;
        var checkImageW, checkImageY;

        var getImage = new Image();
        getImage.onload = splitImage;
        getImage.src = imageBase;

        function componentToHex(c) {
          var hex = c.toString(16);
          return hex.length == 1 ? "0" + hex : hex;
        }

        function rgbToHex(r, g, b) {
          return componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        function splitImage() {
          var checkImageW = ~~(getImage.width / 16);
          var checkImageH = ~~(getImage.height / 16);

          function drawSVG(x, y, xhr) {
            svg = xhr.responseText;
            svgImage = new Image();
            svgImage.src = "data:image/svg+xml," + svg;
            svgImage.load = artboardContext.drawImage(svgImage, x * sliceWidth, y * sliceHeight);
          }

          preview.src = imageBase;

          for(var y = 0; y < checkImageH; ++y) {
            for(var x = 0; x < checkImageW; ++x) {
              var canvas = document.createElement('canvas');
              var image = new Image();
              image.src = imageBase;
              canvas.width = sliceWidth;
              canvas.height = sliceHeight;
              var context = canvas.getContext('2d');
              context.drawImage(image, x * sliceWidth, y * sliceHeight, sliceWidth, sliceHeight, 0, 0, canvas.width, canvas.height);

              var blockSize = 5,
              data,
              i = -4,
              length,
              rgb = {
                r:0,
                g:0,
                b:0
              },
              count = 0;

              colourData = context.getImageData(0, 0, sliceWidth, sliceHeight);
              length = colourData.data.length;

              while ( (i += blockSize * 4) < length ) {
                ++count;
                rgb.r += colourData.data[i];
                rgb.g += colourData.data[i+1];
                rgb.b += colourData.data[i+2];
              }

              rgb.r = ~~(rgb.r / count);
              rgb.g = ~~(rgb.g / count);
              rgb.b = ~~(rgb.b / count);

              var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
              var svg;
              var artboardContext = artboard.getContext('2d');
              var whereX = x * sliceWidth;
              var whereY = y * sliceHeight;

              (function(x, y) {
                var colourReq = new XMLHttpRequest();
                var countX = x;
                var countY = y;
                colourReq.addEventListener("load", function() {
                  drawSVG(countX, countY, this);
                }, false);
                colourReq.open("GET", "/color/" + hex);
                colourReq.send();
              })(x, y);
            }
          }
        }
      }, false);
    });
  }
};

window.onload = function() {
  canva.handleFile.init();
};
