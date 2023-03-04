const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const port = 8080;
const logFile = fs.createWriteStream('history.log', { flags: 'a' });


const dateTimeFormatForLogFile = () => {
  const now = new Date();

  const datePart = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const timePart = now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = `${datePart} ${timePart}`;

  console.log(formattedDate);
  return formattedDate;

}

const writeToLogFile = (req, res, message) => {
  logFile.write(`${dateTimeFormatForLogFile()} - ${req.method} ${req.url} - ${res.statusCode} ${message}\n`);

}

const server = http.createServer(function (req, res) {
  if (req.method === 'GET') {
    const parsedUrl = url.parse(req.url);
    const reqPath = parsedUrl.pathname;

    const filePath = path.join(__dirname, reqPath);

    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => {
      console.log(`Received ${chunk.length} bytes of data`);
      res.write(chunk);
    });
    
    stream.on('end', () => {
      console.log("File Reading Completed");
      res.end();
    });
    
    stream.on('error', (err) => {
      if (err.code == 'ENOENT') {
        res.statusCode = 404;
        res.end('File not found');
      } else if (err.code == 'EACCES') {
        res.statusCode = 403;
        res.end('Permission denied');
      }
      else if(err.code == 'EPERM') {
        res.statusCode = 501;
        res.end("Don't Have Permission");
      } 
      else {
        console.error(err);
        res.statusCode = 500;
        res.end('Internal server error');
      }
    });
  }
  else {
    res.statusCode = 400;
    res.end(req.method + ' Method Not Accepted');
    writeToLogFile(req, res, "Method Not Accepted Sent");
    return;
  }
  // server.close();
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  logFile.write(`Server is running on port ${port}\n`);

});

