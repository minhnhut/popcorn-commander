const BaseRepository = require("./BaseRepository")
const Sequelize = require('sequelize')

class MovieRepository extends BaseRepository {
    constructor(db) {
        super(db, 'Movie')
    }

    define() {
        return {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
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
            },
            imdb_id: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.STRING
            },
            star: {
                type: Sequelize.NUMERIC
            },
            genre: {
                type: Sequelize.STRING
            },
            rating: {
                type: Sequelize.STRING
            },
            reviewStar: {
                type: Sequelize.STRING
            },
            duration: {
                type: Sequelize.STRING
            },
        };
    }

    meta() {
        return {
            tableName: "movies",
            timestamps: true
        };
    }

    relationship(getEntity) {
        const Download = getEntity("Download")
        this.entity.hasMany(Download, {foreignKey: 'movie_id', targetKey: 'id'});
    }
}

module.exports = MovieRepository