const http = require('http');
const fs = require('fs');
const path = require('path');


const port = 3000;
const logFile = fs.createWriteStream('access.log', { flags: 'a' });

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'nature.jpg');
  console.log("Directory Name: ", __dirname);
  console.log("Full Path: ", filePath);

  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      res.statusCode = 404;
      res.end('File not found');
      return;
    }

    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': stat.size,
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    logFile.write(`${new Date()} - ${req.method} ${req.url} - ${res.statusCode}\n`);

  });
  server.close();

}).listen(port);


