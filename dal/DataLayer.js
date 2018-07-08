const Sequelize = require('sequelize');

class DataLayer {
    constructor(pathToDatabase) {
        const sequelize = new Sequelize('database', 'username', 'password', {
            dialect: 'sqlite',
            operatorsAliases: false,
            
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            
            // SQLite only
            storage: pathToDatabase
        });
        sequelize.authenticate().then(() => {
            console.log('Connection has been established successfully.');
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
        });
        this.sequelize = sequelize;
        this.Entity = {};
        this.Entity.Movie = sequelize.define('movies', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            title: {
                type: Sequelize.STRING
            },
            is_downloaded: {
                type: Sequelize.INTEGER
            },
            thumbnail_url: {
                type: Sequelize.STRING
            },
            year: {
                type: Sequelize.STRING
            }
        }, {
            timestamps: false
        });
    }

    dataHandler(request) {
        console.log(request);
        if (request.query) {
            return this.Entity.Movie.findAll(request.query);
        }
    }
}

module.exports = DataLayer;