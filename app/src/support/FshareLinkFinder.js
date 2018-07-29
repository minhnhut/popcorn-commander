const FSharePhim = require("./LinkFinderPlugins/FSharePhim")
const TaiFile = require("./LinkFinderPlugins/TaiFile")
const R = require("ramda")

const filter720pOnly = (link) => {
    console.log(link);
    console.log(link.quality.indexOf("720p") !== -1
    && link.filename.toLowerCase().indexOf("bluray") !== -1
    && link.size_value > 1000);
    return link.quality.indexOf("720p") !== -1
        && link.filename.toLowerCase().indexOf("bluray") !== -1
        && link.size_value > 10000000;
}

module.exports = {
    plugins: [
        FSharePhim,
        TaiFile
    ],
    getFshareUrlForMovie(movie) {
        const promises = this.plugins.map(plugin => plugin.getFshareUrlForMovie(movie, filter720pOnly));
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(linkGroups => {
                links = R.apply(R.concat, linkGroups);
                links = links.filter(link => !!link);
                resolve(links);
            }).catch(reject);
        });
    }
}