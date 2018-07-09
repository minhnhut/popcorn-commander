const BaseRepository = require("./BaseRepository")
const Sequelize = require('sequelize')

class MovieRepository extends BaseRepository {
    constructor(db) {
        super(db, 'movie')
    }

    define() {
        return {
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
        };
    }

    meta() {
        return {
            tableName: "movies",
            timestamps: false
        };
    }
}

module.exports = MovieRepository