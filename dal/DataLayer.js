const Sequelize = require('sequelize');
const operatorsAliases = require('./OperatorsAliases');
const MovieRepository = require('./MovieRepository');

const repositories = {
    MovieRepository
};

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}

class DataLayer {
    constructor(pathToDatabase) {
        const sequelize = new Sequelize('database', 'username', 'password', {
            dialect: 'sqlite',
            storage: pathToDatabase,
            operatorsAliases
        });
        sequelize.authenticate().then(() => {
            console.log('Connection has been established successfully.');
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
        });
        this.sequelize = sequelize;
        this.registerRepositories();
    }

    registerRepositories() {
        this.repositories = {};
        for (const repository in repositories) {
            // if (object.hasOwnProperty(repository)) {
                const repo = new repositories[repository](this.sequelize);
                console.log(repo.entityName + " .. ready");
                this.repositories[repo.entityName] = repo;
            // }
        }
    }

    getRepository(name) {
        if (this.repositories[name]) {
            return this.repositories[name];
        }
        return null;
    }

    getEntity(name) {
        const repo = this.getRepository(name);
        if (repo) {
            return repo.entity;
        }
        return null;
    }

    dataHandler(request) {
        if (request.entity && this.repositories[request.entity]) {
            const repo = this.repositories[request.entity];
            if (request.action && repo[request.action]) {
                if (request.args) {
                    return repo[request.action](request.args);
                } else {
                    return repo[request.action]();
                }
            }
        }
    }

    dataExec(fn) {
        // WIP: Trying to handle depedency injections here,
        // but not work
        //
        // console.log(fn.toString());
        // const params = getParamNames(fn);
        // const injectedParams = [];
        // params.forEach(param => {
        //     console.log(param);
        //     if (param == "Db") {
        //         injectedParams.push(this);
        //     } else {
        //         const entity = this.getEntity(param);
        //         if (entity) {
        //             injectedParams.push(entity);
        //         }
        //     }
        // });
        fn(this);
    }
}

module.exports = DataLayer;