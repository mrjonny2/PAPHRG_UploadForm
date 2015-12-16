
var winston = require('winston');



// Requiring `winston-papertrail` will expose
// `winston.transports.Papertrail`
//
require('winston-papertrail').Papertrail;

var myCustomLevels = {
	levels: {
		info: 0,
		upload: 1,
		debug: 2,
		error: 3,
	},
	colors: {
		info: 'blue',
		upload: 'green',
		debug: 'blue',
		error: 'red'
	}
};

var logger = new winston.Logger({
	transports: [
		new winston.transports.Papertrail({
			host: 'logs3.papertrailapp.com',
			port: 11359,
			handleExceptions: false,
			inlineMeta: false,
			logFormat: function(level, message) {
				return '<<<' + level + '>>> ' + message;
			}
		})
	],
	levels: myCustomLevels.levels
});


var express     = require('express'),
	http        = require('http'),
	app         = express(),
	server      = http.createServer(app),
	io          = require('socket.io').listen(server),
	formidable  = require('formidable');
var fs = require("fs");
var morgan = require('morgan');
var methodOverride = require('method-override');
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var errorhandler = require('errorhandler');
var randomString = require('random-string');

app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('combined'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(serveStatic(__dirname + '/public'));
app.use(cookieParser());
app.use(session({
	secret: 'xxyidooidfuie78889duvdjnsdf9ex',
	resave: false,
	saveUninitialized: true
}));
app.use(errorhandler())

app.get('/', function(req, res) {
	console.log(req.session)
	res.render('index', {session_id: req.session.id});
});

app.post('/', function(req, res) {

		var form            = new formidable.IncomingForm(),
			files           = [],
			fields          = [];

		var uploadDir  = '/mnt/gdrive/MEASURE16/OnlineUploads';
		//var uploadDir  = 'uploads';
		form.uploadDir  = uploadDir;
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
				logger.info('successful upload!');
				fullName = charStrip(fields[0][1])
				fileType = charStrip(fields[1][1])
				for (i = 0; i < files.length; i++) {
					var xRand = randomString({
						length: 8,
						numeric: true,
						letters: true,
						special: false
					});
					console.log("this is file number " + i)
    				console.log(files[i][1].name)
    				originalFileName = (files[i][1].name)
    				strippedFileName = charStrip(files[i][1].name)
    				newFileName = uploadDir + '/' + fullName + '_' + fileType + '_' + xRand + '_' + originalFileName
    				logger.info('fullName = ' + fullName);
					logger.info('fileType = ' + fileType);
					logger.info('fileName = ' + originalFileName);
					fs.rename(files[i][1].path, newFileName, function (err) {
						if (err){
							logger.error('err = ' + err);
							console.log('err = ' + err)
						}
						else{
							logger.debug('A file was successfully uploaded by:\n' + fullName + '\nThe file was a ' + fileType + '\nThe file was saved to:\n' + newFileName);
							console.log('A file was successfully uploaded by:\n' + fullName + '\nThe file was a ' + fileType + '\nThe file was saved to:\n' + newFileName);
						}
					});
				}
				res.render('upload', {fields: fields, files: files});
			})
			.parse(req, function(){});
});

server.listen(app.get('port'), function(){
	logger.info("Express server listening on port " + app.get('port'));
}).on('error', function(err){
    console.log('on error handler');
    console.log(err);
});

/*process.on('uncaughtException', function(err) {
    console.log('process.on handler');
    console.log(err);
});
*/


function charStrip(string){
	strippedString = string.replace(/[^a-zA-Z0-9]/g,'_');
	return strippedString;
}





