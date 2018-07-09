// Basic init
const electron = require('electron')
const DataLayer = require('./dal/DataLayer')
const path = require('path');
const {app, BrowserWindow, ipcMain} = electron

// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(__dirname)

const db = new DataLayer(path.resolve(__dirname, "movie.db"));

global.dbHandler = db.dataHandler;
global.dbExec = (request) => db.dataExec(request);
global.db = db;
global.dbOp = require('Sequelize').Op;

// To avoid being garbage collected
let mainWindow

app.on('ready', () => {

    let mainWindow = new BrowserWindow({width: 800, height: 600})

    mainWindow.loadURL(`file://${__dirname}/app/index.html`)

    ipcMain.on('datalink', (event, request) => db.dataHandler(request));

})
