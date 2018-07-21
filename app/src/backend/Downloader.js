import {remote, ipcRenderer} from "electron"
const backend = remote.getGlobal("backend");
const getDirectUrlFromFshareUrl = backend.getDirectUrlFromFshareUrl;
const makeDownloaderFromDirectUrl = backend.makeDownloaderFromDirectUrl;

export default {
    downloadFolderPath: backend.downloadFolderPath,
    downloaderOptions: backend.downloaderOptions,
    getDirectUrlFromFshareUrl,
    makeDownloaderFromDirectUrl
}