const path = require('path')
const DataLayer = require('../dal/DataLayer')
const {getLinksVip} = require('linksvip-getter')
const rapid = require('rapid-downloader')
const fs = require('fs')

module.exports = class {
    constructor({dbPath, fshareLogin, downloadFolderPath, downloaderOptions, afterDownloadMoviePath}) {
        const db = new DataLayer(dbPath);
        this.dbExec = (request) => db.dataExec(request);
        this.db =  db;
        this.fshareLogin = fshareLogin;
        this.downloadFolderPath = downloadFolderPath;
        this.downloadPool = {};
        this.needRefresh = [];
        this.downloaderOptions = downloaderOptions;
        this.afterDownloadMoviePath = afterDownloadMoviePath;

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
                const finishDownload = (finalPath) => {
                    delete this.downloadPool[id];
                    const Movie = this.db.getEntity("Movie");
                    Movie.update({is_downloaded: 1}, {where: {id: id}})
                    .then(() => {
                        this.needRefresh.push(id);
                    });
                };
                if (this.afterDownloadMoviePath) {
                    const sourcePath = downloader.saveToPath;
                    const targetFilePath = path.resolve(this.afterDownloadMoviePath, path.basename(downloader.saveToPath));
                    fs.copyFile(
                        sourcePath,
                        targetFilePath,
                        err => {
                            if (err) {
                                console.log('Failed to movie file, it is still in downloads folder');
                                finishDownload(sourcePath);
                            } else {
                                finishDownload(targetFilePath)
                            }
                        }
                    );
                } else {
                    finishDownload(sourcePath);
                }
                if (callback) callback('end');
            })
            downloader.start();
        });
    }

    flushState() {
        this.needRefresh = [];
    }
};