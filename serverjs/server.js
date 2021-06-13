
/**
	* Node.js Login Boilerplate
	* More Info : https://github.com/braitsch/node-login
	* Copyright (c) 2013-2020 Stephen Braitsch
**/

var fs = require('fs');
var http = require('http');
var https = require('https');
const ping = require('ping');
var express = require('express');
var session = require('express-session');
var LU = require('./live_url');

var privateKey  = fs.readFileSync('certificate/private.key.pem', 'utf8');
var certificate = fs.readFileSync('certificate/public.key.pem', 'utf8');
var intermediate = fs.readFileSync('certificate/intermediate.cert.pem', 'utf8');
var domain = fs.readFileSync('certificate/domain.cert.pem', 'utf8');

var credentials = {key: privateKey, cert: domain, ca: intermediate};
var express = require('express');
var app = express();

app.locals.pretty = true;
app.set('port', process.env.PORT || 80);
app.set('server', "193.7.197.62");

app.use(session({
	secret: '5894765tyehuirgb34r58otgy23h49ftubn3fgui9op34rfthy23dfujxcnm',
	proxy: true,
	resave: true,
	saveUninitialized: true,
    httpOnly: true,
    secure: true
	})
);

async function hostping(host) {
    let status = true;
    const res = await ping.promise.probe(host);
    if (!res.alive) { status = false; }
    return await status;
}

app.get('/channel/:id', function (req, res, next) {
    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');
    if(req.params.id != null){
        LU.get_live_stream(req.params.id).then((x)=>{
            if(x[2]){
                res.set('proxystatus', '200');
                res.status(x[1]).send(x[0]);
            }else{
                res.set('proxystatus', '404');
                res.status(x[1]).send(x[0]);
            }
        })
    }
});
app.get('/on', function (req, res, next) {
	res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');
    status = true;
    if(status){
        res.set('proxystatus', '200');
        res.send("ok");
    }else{
        res.set('proxystatus', '500');
        res.send("Server proxy Offline :(");
    }
});

var http = express();
http.get('/channel/:id', function(req, res) {
	res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('proxystatus', '200');
    if(req.params.id != null){
        LU.get_live_stream(req.params.id).then((x)=>{ res.status(x[1]).send(x[0]);})
    }
})
http.get('/on', function(req, res) {
	res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');
    status = true;
    if(status){
        res.set('proxystatus', '200');
        res.send("ok");
    }else{
        res.set('proxystatus', '500');
        res.send("Server proxy Offline :(");
    }
    
})

http.listen(app.get('port'));

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443, function(){
	console.log('Express server listening on port ' + 443);
});