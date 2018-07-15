const path = require('path')
const DataLayer = require('../dal/DataLayer')
const {getLinksVip} = require('linksvip-getter')
const rapid = require('rapid-downloader')

module.exports = class {
    constructor({dbPath, fshareLogin, downloadFolderPath, downloaderOptions}) {
        const db = new DataLayer(dbPath);
        this.dbExec = (request) => db.dataExec(request);
        this.db =  db;
        this.fshareLogin = fshareLogin;
        this.downloadFolderPath = downloadFolderPath;

        const makeDownloader = (directUrl, callback) => {
            console.log("direct link fetched: " + directUrl);
            callback('direct_fetched');
            console.log(path.resolve(this.downloadFolderPath, path.basename(directUrl)));
            const downloader = this.makeDownloader(directUrl, path.resolve(this.downloadFolderPath, path.basename(directUrl)), downloaderOptions);
            downloader.on("ready", () => {
                downloader.on('progress', (progress) => {
                    if (callback) {
                        callback('progress', progress)
                    }
                    //const speed = rapid.utils.dynamicSpeedUnitDisplay(progress.bytesPerSecond);
                    //console.log(`${progress.percent}% - ${speed}`)
                })
                downloader.on('end', () => {
                    if (callback) {
                        callback('end')
                    }
                })
                downloader.start();
            });
        }

        this.getDirectUrlFromFshareUrl = (fshareUrl) => getLinksVip(fshareUrl, this.fshareLogin);
        this.makeDownloaderFromFshareUrl = (fshareUrl, callback) => getLinksVip(fshareUrl, fshareLogin).then((directUrl) => makeDownloader(directUrl, callback));
        this.makeDownloaderFromDirectUrl = makeDownloader;

    }

    makeDownloader(url, saveTo, options) {
        return new rapid.DownloadWorker(url, saveTo, options)
    }
};