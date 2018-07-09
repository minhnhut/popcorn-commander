const Sequelize = require('sequelize');
const operatorsAliases = require('./OperatorsAliases');
const MovieRepository = require('./MovieRepository');

const repositories = {
    MovieRepository
};

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

    dataExec(request) {
        if (request.query) {
            console.log(request);
            request.query.call(this);
        }
    }
}

module.exports = DataLayer;