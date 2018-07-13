const BaseRepository = require("./BaseRepository")
const Sequelize = require('sequelize')

class DownloadRepository extends BaseRepository {
    constructor(db) {
        super(db, 'Download')
    }

    define() {
        return {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            movie_id: {
                type: Sequelize.INTEGER
            },
            server: {
                type: Sequelize.STRING
            },
            download_url: {
                type: Sequelize.STRING
            },
            filename: {
                type: Sequelize.STRING
            },
            size: {
                type: Sequelize.STRING
            },
            quality: {
                type: Sequelize.STRING
            },
            size_value: {
                type: Sequelize.INTEGER
            }
        };
    }

    meta() {
        return {
            tableName: "downloads",
            timestamps: false
        };
    }
}

module.exports = DownloadRepository