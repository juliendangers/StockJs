var http = require("http");
var url  = require('url');
var fs   = require('fs');
var io   = require('socket.io');

var server = http.createServer(function(request, response){
    console.log('Connection');
    var path = url.parse(request.url).pathname;
    
    switch(path){
    case '/':
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write('hello world');
        break;
    case 'socket.html':
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(data, "utf8");
        break;
    default:
	fs.readFile(__dirname + '404.html', function(error, data){
            // how could it not exist ?!
	    if (error){
                response.writeHead(404);
                response.write("opps this doesn't exist - 404");
            } else{
                response.writeHead(404, {"Content-Type": "text/html"});
                response.write(data, "utf8");
            }
        });
        break;
    }
    response.end();
});

server.listen(8080);

//var io.listen(server);
