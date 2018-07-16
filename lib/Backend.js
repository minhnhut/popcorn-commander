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
        this.downloadPool = {};
        this.needRefresh = [];
        this.downloaderOptions = downloaderOptions;

        this.getDirectUrlFromFshareUrl = (fshareUrl) => getLinksVip(fshareUrl, this.fshareLogin);
        this.makeDownloaderFromDirectUrl = (id, directUrl, callback) => this.makeDownloader(id, directUrl, callback);

    }

    makeDownloader(id, directUrl, callback) {
        const downloader = new rapid.DownloadWorker(directUrl, path.resolve(this.downloadFolderPath, path.basename(directUrl)), this.downloaderOptions);
        this.downloadPool[id] = downloader;
        console.log(id);
        downloader.on("ready", () => {
            console.log("direct link fetched: " + directUrl);
            if (callback) {
                callback('direct_fetched');

                downloader.on('progress', (progress) => {
                    if (callback) {
                        callback('progress', progress)
                    }
                })
                
            }
            downloader.on('end', () => {
                delete this.downloadPool[id];
                const Movie = this.db.getEntity("Movie");
                Movie.update({is_downloaded: 1}, {where: {id: id}})
                .then(() => {
                    this.needRefresh.push(id);
                });
                if (callback) {
                    callback('end')
                }
            })
            downloader.start();
        });
    }

    flushState() {
        this.needRefresh = [];
    }
};