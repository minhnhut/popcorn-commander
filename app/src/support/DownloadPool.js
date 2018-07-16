module.exports = {
    pool: {},
    update(pool) {
        this.pool = pool;
    },
    getDownloadByImdbId(imdbId) {
        return this.pool[imdbId] ? this.pool[imdbId] : null;
    }
}