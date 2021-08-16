var fs = require('fs');
var https = require('https');
var express = require('express');
var session = require('express-session');

var LU = require('./twHLS');
var PC = require('./proxyFetch');

//ssl
var privateKey = fs.readFileSync('certificate/private.key.pem', 'utf8');
var certificate = fs.readFileSync('certificate/public.key.pem', 'utf8');
var intermediate = fs.readFileSync('certificate/intermediate.cert.pem', 'utf8');
var domain = fs.readFileSync('certificate/domain.cert.pem', 'utf8');

var credentials = { key: privateKey, cert: domain, ca: intermediate };


var app = express();
app.disable('x-powered-by');
app.disable('etag');

app.get('/hls/v2/sig/:links/:server', function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.removeHeader('Connection');
    res.removeHeader('Date');
    res.set('Access-Control-Allow-Origin', '*');

    if (req.params.links != null) {
        PC.requestUrlByProxy((req.params.links).toString(), (req.params.server).toString()).then((x) => {
            console.log("true")
            if (x) {
                res.status(200).send();
            } else {
                res.status(404).send();
            }
        })
    }
});
app.get('/hls/v2/channel/:channelName', function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.removeHeader('Connection');
    res.set('Content-Length', '');
    res.removeHeader('Date');
    res.removeHeader('X-DNS-Prefetch-Control');
    if (req.params.channelName != null) {
        LU.getNewHLS((req.params.channelName).toString(), '').then((x) => {
            if (x[2]) {
                let c = "";
                if (x[1] == "200") {
                    let REGEX = /RESOLUTION=(\S+),C(?:^|\S+\s+\S+)video-weaver.(\S+).hls.ttvnw.net\/v1\/playlist\/(\S+).m3u8/g;
                    while ((m = REGEX.exec(x[0])) !== null) {
                        if (m[1].substr(m[1].indexOf('x') + 1, m[1].length) <= 480) {
                            break;
                        }

                        c = c ? c + "." + m[1] + "." + m[3] : c + m[2] + "." + m[1] + "." + m[3];

                        PC.requestUrlByProxy(m[3], m[1]).then((r) => {
                        });
                    }
                } else {
                    c = x[0];
                }

                res.set('proxystatus', '200');
                res.status(x[1]).send(c);

            } else {
                res.set('proxystatus', '404');
                res.status(x[1]).send(x[0]);
            }
        })
    }
});
app.get('/channel/:channelName', function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.removeHeader('Connection');
    res.set('Content-Length', '');
    res.removeHeader('Date');
    if (req.params.channelName != null) {
        LU.readm3u8((req.params.channelName).toString(), null).then((x) => {
            if (x[2]) {
                res.set('proxystatus', '200');
                res.status(x[1]).send(x[0]);
            } else {
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
    if (status) {
        res.set('proxystatus', '200');
        res.send("ok");
    } else {
        res.set('proxystatus', '500');
        res.send("Server proxy Offline :(");
    }
});

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443, function () {
    console.log('Express server listening on port ' + 443);
});