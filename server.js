var express = require('express');
var app =express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://' + process.env.MLAB_USERNAME + ':' + process.env.MLAB_PASSWORD + '@ds053146.mlab.com:53146/codefiasco-sites');
var Schema = mongoose.Schema;

var urlSchema = new Schema({
    fullUrl: String,
    shortUrl: String
});

var Site = mongoose.model('Site', urlSchema);

var router = express.Router();

router.get('/:url', function (req, res) {
    Site.findOne({ shortUrl: req.params.url }, function (err, result) {
        if (err) throw err;

        if(!result) {
            res.send('URL not found!');
        }
        else {
            res.redirect(result.fullUrl);
        }
    });
});

router.get('/new/*', function (req, res) {

    if (validateUrl(req.params[0])) {
        Site.findOne({ fullUrl: req.params[0] }, function (err, result) {
            if (err) throw err;

            if(!result) {
                var url = generateUrl();

                var newUrl = Site({
                    fullUrl: req.params[0],
                    shortUrl: url
                });

                newUrl.save(function (err) {
                    if (err) throw err;

                    console.log('New url saved');

                    res.json({
                        full_url: req.params[0],
                        short_url: url
                    });
                });
            }
            else {
                res.json({
                    full_url: result.fullUrl,
                    short_url: parseInt(result.shortUrl)
                });
            }
        });
    }
    else {
        console.log('Invalid URL provided: ' + req.params[0]);
        res.send('Please enter a valid URL.');
    }
});

app.use('/', router);
app.listen(process.env.PORT || 3000);

function generateUrl () {
    var url, flag;

    do {
        url = Math.floor(Math.random()*90000) + 10000;
        Site.findOne({ shortUrl: url}, function (err, result) {
            if (err) throw err;

            flag = result;
        });
    } 
    while (flag);

    return url;
}

function validateUrl(url){
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);

    return url.match(regex);
}