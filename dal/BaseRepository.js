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

    findOne() {
        return this.entity.findOne();
    }

    findAll(queryParams) {
        console.log(queryParams);
        return this.entity.findAll(queryParams);
    }

}

module.exports = BaseRepository;