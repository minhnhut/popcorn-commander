// Basic init
const electron = require('electron')
const path = require('path')
const Backend = require('./lib/Backend')
const Config = require('./config')
const R = require('ramda')
const {app, BrowserWindow} = electron

// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(path.resolve(__dirname, "app"))
const backend = new Backend(Config);
global.backend = backend;

// To avoid being garbage collected
let mainWindow

app.on('ready', () => {
    // BrowserWindow.addDevToolsExtension(path.resolve(__dirname, "vue-devtools.crx"));
    let mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 600
    })
    mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    
    setInterval(() => {
        const getProgress = worker => worker.getProgress();
        const getAllProgress = R.mapObjIndexed(getProgress);
        mainWindow.webContents.send("backend-update-link", {
            downloadPool: getAllProgress(backend.downloadPool),
            needRefresh: backend.needRefresh
        });
        backend.flushState();
    }, 500);
})
