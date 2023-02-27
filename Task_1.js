const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const port = 8080;

const server = http.createServer(function (req, res) {
    if (req.method == "GET") {
        const parsedUrl = url.parse(req.url);
        const hostName = parsedUrl.hostname || req.headers.host;
        const reqPath = parsedUrl.pathname;

        const myDirectory = __dirname;
        const filePath = path.join(myDirectory, reqPath);

        console.log(filePath);

        fs.access(filePath, fs.constants.R_OK, (err) => {
            if (err) {
              res.statusCode = 404;
              res.end('File not found');
              server.close();
              return;
            }
        
            const stat = fs.statSync(filePath);
        
            res.writeHead(200, {
              'Content-Type': 'image/jpeg',
              'Content-Length': stat.size,
            });
        
            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        
            // logFile.write(`${new Date()} - ${req.method} ${req.url} - ${res.statusCode}\n`);
        
          });

        // res.statusCode = 200;
        // res.setHeader('Content-Type', 'text/plain');
        // res.end(`Host Name: ${hostName} Requested URL: ${req.url}\nDirectory: ${myDirectory}\nPath: ${reqPath}\nFile Path: ${filePath} `);
        // console.log("GET Method Requested");

        server.close();
    }
}).listen(port);
