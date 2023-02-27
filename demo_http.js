var http = require('http');
var url = require('url');

const server = http.createServer(function (req, res) {
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('Hello World! My Dear Osman@DSi');
    var q = url.parse(req.url, true).query;
    console.log( q);
    var txt = q.year + " " + q.month;
    res.write(txt);
    res.end();
    server.close();
}).listen(8080)