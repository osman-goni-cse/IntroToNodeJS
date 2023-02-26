var http = require('http');
var fs = require('fs');

const server = http.createServer(function (req, res) {
    fs.readFile('index.html', function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
    server.close();
}).listen(3000)

fs.appendFile('myNewFile.txt', 'Hello DSi@n', function(err) {
    if(err) throw err;
    console.log("File Saved");
})