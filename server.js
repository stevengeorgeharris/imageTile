
var mosaic = require('./js/mosaic.js');
var fs = require('fs');
var http = require('http');
var url = require('url');
var path = require('path');
var util = require('util');

var dir = path.dirname(fs.realpathSync(__filename));
var svgTemplate = [
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="%d" height="%d">',
    '<rect width="' + mosaic.TILE_WIDTH + '" height="' + mosaic.TILE_HEIGHT + '" fill="#%s"></rect>',
  '</svg>'
].join('');

http.createServer(function (req, res) {
  var pathname = url.parse(req.url).pathname;
  var m,
      filename,
      stats;

  if (pathname == '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream(dir + '/mosaic.html').pipe(res);
    return;
  } else if (m = pathname.match(/^\/js\//)) {
    filename = dir + pathname;
    stats = fs.existsSync(filename) && fs.statSync(filename);
    if (stats && stats.isFile()) {
      res.writeHead(200, {'Content-Type' : 'application/javascript'});
      fs.createReadStream(filename).pipe(res);
      return;
    }
  } else if (m = pathname.match(/^\/color\/([0-9a-fA-F]{6})/)) {
    res.writeHead(200, {'Content-Type': 'image/svg+xml'});
    res.write(util.format(svgTemplate, mosaic.TILE_WIDTH, mosaic.TILE_HEIGHT, m[1]));
    res.end();
    return;
  } else if (m = pathname.match(/^\/css\//)) {
    filename = dir + pathname;
    stats = fs.existsSync(filename) && fs.statSync(filename);
    if (stats && stats.isFile()) {
      res.writeHead(200, {'Content-Type': 'text/css'});
      fs.createReadStream(filename).pipe(res);
      return;
    }
  }
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.write('404 Not Found\n');
  res.end();
}).listen(process.env.PORT || 8765);

console.log('mosaic server running on port 8765');
