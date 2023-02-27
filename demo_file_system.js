const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const port = 8080;

const server = http.createServer(function (req, res) {
  if (req.method === 'GET') {
    const parsedUrl = url.parse(req.url);
    const reqPath = parsedUrl.pathname;

    // Get the file extension from the requested path
    const fileExtension = path.extname(reqPath);

    // Set the default content type
    let contentType = 'text/plain';

    // Set the appropriate content type based on the file extension
    switch (fileExtension) {
      case '.html':
        contentType = 'text/html';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.jpeg':
      case '.jpg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }

    // Get the file path relative to the server root directory
    const filePath = path.join(__dirname, reqPath);

    // Check if the file exists and is readable
    fs.access(filePath, fs.constants.R_OK, (err) => {
      if (err) {
        res.statusCode = 404;
        res.end('File not found');
        return;
      }

      // Check if the file extension matches the content type
      if (!contentType.startsWith('image') && !contentType.startsWith('text')) {
        res.statusCode = 415;
        res.end('Unsupported media type');
        return;
      }

      // Get the file stats to set the content length
      const stat = fs.statSync(filePath);

      // Set the response headers
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
      });

      // Create a read stream for the file and pipe it to the response
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  }
  server.close();
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
