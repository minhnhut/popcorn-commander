const Sequelize = require('sequelize')

/**
 * @property {Sequelize} db
 * @property {*} entity
 */
class BaseRepository {
    /**
     * Init repository
     * @param {Sequelize} db 
     */
    constructor(db, entityName) {
        this.db = db;
        this.entityName = entityName;
        this.entity = this.db.define(entityName, this.define(), this.meta());
    }

    define() {
        // should be overrided by sub-class
    }

    meta() {
        return {};
    }

    relationship() {
        return {};
    }

    findOne() {
        return this.entity.findOne();
    }

    findAll(queryParams) {
        return this.entity.findAll(queryParams);
    }

    findOrCreate(queryParams) {
        return this.entity.findOrCreate(queryParams);
    }

    findAndCountAll(queryParams) {
        return this.entity.findAndCountAll(queryParams);
    }

}

module.exports = BaseRepository;