var winston = require('winston');

// Requiring `winston-papertrail` will expose
// `winston.transports.Papertrail`
//
require('winston-papertrail').Papertrail;

var logger = new winston.Logger({
	transports: [
		new winston.transports.Papertrail({
			host: 'logs3.papertrailapp.com',
			port: 11359,
			handleExceptions: true,
			inlineMeta: true,
			logFormat: function(level, message) {
				return '<<<' + level + '>>> ' + message;
			}
		})
	]
});


var express     = require('express'),
	http        = require('http'),
	app         = express(),
	server      = http.createServer(app),
	io          = require('socket.io').listen(server).set('log level', 1),
	formidable  = require('formidable');
var fs = require("fs");


app.configure(function(){
	app.set('port', process.env.PORT || 80);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/public'));
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'xxx', store: new express.session.MemoryStore({ reapInterval: -1 }) }));
	app.use(express.errorHandler());
});

app.get('/', function(req, res) {
	res.render('index', {session_id: req.session.id});
});

app.post('/', function(req, res) {

		var form            = new formidable.IncomingForm(),
			files           = [],
			fields          = [];

		form.uploadDir  = '/googleDrive/MEASURE15/OnlineUploads';
		form
			.on('field', function(field, value) {
				//console.log(field, value);
				fields.push([field, value]);
			})
			.on('file', function(field, file) {
				//console.log(field, file);
				files.push([field, file]);
			})
			.on('progress', function(bytesReceived, bytesExpected) {
				var filesize = (bytesExpected / 1024 / 1024).toFixed(1);
				var progress = (bytesReceived / bytesExpected * 100).toFixed(1);
				io.sockets.emit(req.session.id, {filesize: filesize, progress: progress});
			})
			.on('end', function() {
				console.log('successfully uploaded!');
				fullName = charStrip(fields[0][1])
				fileType = charStrip(fields[1][1])
				originalFileName = (files[0][1].name)
				strippedFileName = charStrip(files[0][1].name)
				newFileName = uploadDir + '/' + fullName + '_' + fileType + '_' + originalFileName
				console.log('fullName = ' + fullName);
				console.log('fileType = ' + fileType);
				console.log('fileName = ' + originalFileName);
				fs.rename(files[0][1].path, newFileName, function (err) {
					if (err){
						console.log('err = ' + err);
					}
				});
				res.render('upload', {fields: fields, files: files});
			});
		form.parse(req, function(){
			console.log(files[0][1].path)
		});
});

server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});



function charStrip(string){
	strippedString = string.replace(/[^a-zA-Z0-9]/g,'_');
	return strippedString;
}





