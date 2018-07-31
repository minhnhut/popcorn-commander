const FSharePhim = require("./LinkFinderPlugins/FSharePhim")
const TaiFile = require("./LinkFinderPlugins/TaiFile")
const R = require("ramda")

const filter720pOnly = (link) => {
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
                linkGroups = linkGroups.filter(group => !!group);
                let links = (
                    linkGroups.length > 1 ? R.apply(R.concat, linkGroups) :
                    linkGroups.length > 0 ? linkGroups[0] :
                    []
                );
                links = links.filter(link => !!link);
                resolve(links);
            }).catch(reject);
        });
    }
}