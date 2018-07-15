import {remote, ipcRenderer} from "electron"
const backend = remote.getGlobal("backend");
const getDirectUrlFromFshareUrl = backend.getDirectUrlFromFshareUrl;
const makeDownloaderFromDirectUrl = backend.makeDownloaderFromDirectUrl;

export default {
    getDirectUrlFromFshareUrl,
    makeDownloaderFromDirectUrl
}