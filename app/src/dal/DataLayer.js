import {remote, ipcRenderer} from "electron"
import { exec } from "child_process";

const dbHandler = remote.getGlobal("dbHandler");
const dbExec = remote.getGlobal("dbExec");
const db = remote.getGlobal("db");

export default {

    getRepository: (name) => db.getRepository(name),

    query: (entityName, action, args) => {
        const result = db.dataHandler({
            entity: entityName,
            action: action,
            args: args 
        });
        //const result = dbHandler();
        console.log(db.repositories["movie"].findOne());
        db.repositories["movie"].findOne().then(data => {
            console.log(data);
        })
        // ipcRenderer.send("datalink", {
        //     callback: 
        //     entity: entityName,
        //     action: action,
        //     args: args
        // });
    },
    exec: (fn) => {
        return dbExec(fn);
    }
}