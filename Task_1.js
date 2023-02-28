const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const port = 8080;
const logFile = fs.createWriteStream('history.log', { flags: 'a' });

const getContentType = (fileExtension) => {
  // Set the appropriate content type based on the file extension
  let contentType = 'text/plain';

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
    case '.pdf':
      contentType = 'application/pdf';
      break;
  }
  return contentType;
}

const checkFileTypeBasedOnMagicNumber = (fileContent, fileExtension) => {
  let realFileExtension;

  if (fileContent[0] === 0xff && fileContent[1] === 0xd8) {
    // console.log('File is a JPEG image');
    if (fileExtension == ".jpeg")
      realFileExtension = ".jpeg";
    else if(fileExtension == ".jpg")
      realFileExtension = ".jpg";
    else
      realFileExtension = ".";
  } else if (fileContent[0] === 0x89 && fileContent.toString('ascii', 1, 4) === 'PNG') {
    // console.log('File is a PNG image');
    realFileExtension = ".png";
  } else if (fileContent.toString('ascii', 0, 4) === '%PDF') {
    // console.log('File is a PDF document');
    realFileExtension = ".pdf";
  } else {
    // console.log('File type is unknown');
    realFileExtension="This Type of File is not Handled Or Your File Content Does Not Match With it's content.";
  }
  return realFileExtension;

}


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

const server = http.createServer(function (req, res) {
  if (req.method === 'GET') {
    const parsedUrl = url.parse(req.url);
    const reqPath = parsedUrl.pathname;

    // Get the file extension from the requested path
    var fileExtension = path.extname(reqPath);

    // Find content type
    let contentType = getContentType(fileExtension);

    const filePath = path.join(__dirname, reqPath);

    console.log("Directory Name: ", __dirname);
    console.log("File Path: ", reqPath);

    // Check if the file exists and is readable
    fs.access(filePath, fs.constants.R_OK, (err) => {
      if (err) {
        res.statusCode = 404;
        res.end('File not found');
        logFile.write(`${dateTimeFormatForLogFile()} - ${req.method} ${req.url} - ${res.statusCode}\nFile Not Found Response Sent.\n`);

        return;
      }

      // Read the file contents
      const fileContent = fs.readFileSync(filePath);
      
      // Check the file type based on its magic number
      var realFileExtension = checkFileTypeBasedOnMagicNumber(fileContent, fileExtension);

      
      console.log("File Extension: ", fileExtension);
      console.log("REal Extension: ", realFileExtension);

      if (realFileExtension[0] != '.') {
        res.statusCode = 500;
        res.end("This Type of File is not handled.");
        logFile.write(`${dateTimeFormatForLogFile()} - ${req.method} ${req.url} - ${res.statusCode}\nFile Type is unknown.\n`);
        return;
      }

      if (fileExtension != realFileExtension) {
        res.statusCode = 415;
        res.end("Your File Content Does Not Match With It's Extension.");
        logFile.write(`${dateTimeFormatForLogFile()} - ${req.method} ${req.url} - ${res.statusCode}\nFile May be damaged response sent.\n`);

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

      logFile.write(`${dateTimeFormatForLogFile()} - ${req.method} ${req.url} - ${res.statusCode}\nSuccessfully sent response.\n`);

    });
  }
  else {
    res.statusCode = 400;
    res.end(req.method + ' Method Not Accepted');
    logFile.write(`${dateTimeFormatForLogFile()} - ${req.method} ${req.url} - ${res.statusCode}\n Method Not Accepted response sent.\n`);

    return;
  }
  server.close();
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  logFile.write(`Server is running on port ${port}\n`);

});
