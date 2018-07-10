const axios = require("axios")
const R = require("ramda")

module.exports = {
    search(titleToSearch) {
        return new Promise((resolve, reject) => {
            if (!titleToSearch) {
                resolve([]);
            }
            const lowerCase = titleToSearch.toLowerCase().replace(" ", "_").replace("-", "_").replace("+", "_");
            const firstLetter = lowerCase.substring(0,1);
            axios.get(`https://v2.sg.media-imdb.com/suggests/${firstLetter}/${lowerCase}.json`)
            .then(res => {
                const cleanUpResponse = R.replace(/imdb\$[a-zA-Z_0-9]+\((.*)\)/, '$1');
                const transformData = data => {
                    const parseStars = R.compose(
                        R.map(R.trim),
                        R.split(","),
                        R.defaultTo("")
                    );
                    const parseThumbnailUrl = R.compose(
                        R.nth(0),
                        R.defaultTo([""])
                    );
                    return {
                        id: data.id,
                        thumbnail_url: parseThumbnailUrl(data.i),
                        title: data.l,
                        year: data.y,
                        star: parseStars(data.s)
                    }
                };

                const isMovie = (data) => data.id.substring(0, 2) == 'tt';

                const parseData = R.compose(
                    R.map(transformData),
                    R.filter(isMovie),
                    R.prop("d"),
                    JSON.parse,
                    cleanUpResponse
                );
                const data = parseData(res.data);
                resolve(data);
            })
            .catch(e => {
                reject(e);
            });
        });
    }
}