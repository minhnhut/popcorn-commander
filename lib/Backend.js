const path = require('path')
const DataLayer = require('../dal/DataLayer')
const {getLinksVip} = require('linksvip-getter')
const rapid = require('rapid-downloader')
const fs = require('fs')
const puppeteer = require('puppeteer');

function getChromiumExecPath() {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}

module.exports = class {
    constructor({dbPath, fshareLogin, downloadFolderPath, downloaderOptions, afterDownloadMovePath}) {
        const db = new DataLayer(dbPath);
        this.dbExec = (request) => db.dataExec(request);
        this.db =  db;
        this.fshareLogin = fshareLogin;
        this.downloadFolderPath = downloadFolderPath;
        this.downloadPool = {};
        this.needRefresh = [];
        this.downloaderOptions = downloaderOptions;
        this.afterDownloadMovePath = afterDownloadMovePath;


        this.getDirectUrlFromFshareUrl = (fshareUrl) => {
            return getLinksVip(
                fshareUrl,
                this.fshareLogin,
                {args: ['--no-sandbox'], executablePath: getChromiumExecPath()}
            )
        };
        this.makeDownloaderFromDirectUrl = (id, directUrl, callback) => this.makeDownloader(id, directUrl, callback);

    }

    makeDownloader(id, directUrl, callback) {
        const downloader = new rapid.DownloadWorker(directUrl, path.resolve(this.downloadFolderPath, path.basename(directUrl)), this.downloaderOptions);
        this.downloadPool[id] = downloader;
        console.log(id);
        downloader.on("error", (e) => {
            console.log(e);
            downloader.state = "error";
        });
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
                const sourcePath = downloader.saveToPath;
                if (this.afterDownloadMovePath) {
                    const targetFilePath = path.resolve(this.afterDownloadMovePath, path.basename(sourcePath));
                    const finalProgress = this.downloadPool[id].getProgress();
                    finalProgress.state = "moving";
                    this.downloadPool[id] = {getProgress: () => finalProgress};
                    const rs = fs.createReadStream(sourcePath);
                    // const tmpPath = targetFilePath;
                    // let tmpNum = 1;
                    // while (fs.exists(tmpPath)) {
                    //     tmpPath = path.resolve(this.afterDownloadMovePath, path.filename(sourcePath))
                    // }
                    const ws = fs.createWriteStream(targetFilePath);
                    rs.pipe(ws);
                    ws.on('close', () => {
                        fs.unlink(sourcePath);
                        finishDownload(targetFilePath);
                    });
                    ws.on('error', () => {
                        console.log('Failed to movie file, it is still in downloads folder');
                        finishDownload(sourcePath);
                    });
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