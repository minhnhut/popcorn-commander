var url = require("url")
var path = require("path")
var mtd = require('zeltice-mt-downloader')
 
var target_url = "http://ipv4.download.thinkbroadband.com/1GB.zip"
var file_name = path.basename(url.parse(target_url).pathname)
var file_path = path.join(__dirname, file_name)
 
var downloader = new mtd(file_path, target_url, {
    onStart: function(meta) {
        // console.log('Download Started', meta);

        setInterval(() => {
            console.log(this);
        }, 1000);
    },
});

downloader.start();

