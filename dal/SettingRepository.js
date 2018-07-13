const BaseRepository = require("./BaseRepository")
const Sequelize = require('sequelize')

class Repository extends BaseRepository {
    constructor(db) {
        super(db, 'Setting')
    }

    define() {
        return {
            key: {
                type: Sequelize.STRING
            },
            value: {
                type: Sequelize.STRING
            }
        };
    }

    meta() {
        return {
            tableName: "settings",
            timestamps: false
        };
    }
}

module.exports = Repository