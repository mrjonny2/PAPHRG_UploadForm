var express = require('express');
var app = express();

app.get('/', function (req, res) {
	res.redirect(301, 'https://www.dropbox.com/request/8bw5ObSND4RViSa2Cy1O');
});

var portNumber = process.env.PORT || 80;

var server = app.listen(portNumber, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});