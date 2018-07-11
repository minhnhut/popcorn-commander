const axios = require("axios")
const R = require("ramda")
const cheerio = require("cheerio")
const {tryOrDefault} = require("tryordefault")

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
                        R.trim,
                        // R.split(","),
                        R.defaultTo("")
                    );
                    const parseThumbnailUrl = R.compose(
                        R.nth(0),
                        R.defaultTo([""])
                    );
                    return {
                        imdb_id: data.id,
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
    },
    getById(id)
    {
        return new Promise((resolve, reject) => {
            axios.get('https://www.imdb.com/title/'+id+'/')
            .then(res => {
                const $ = cheerio.load(res.data);
    
                // year
                const rawYear = $("#titleYear").text();
                const cleanUpYear = cleanUpBracket = R.replace(/\((\d{4})\)/, "$1");
                const year = cleanUpYear(rawYear);
    
                // title
                const removeYear = R.replace(rawYear, "");
                const cleanUpTitle = R.compose(
                    R.trim,
                    removeYear
                );
                const title = cleanUpTitle($("h1[itemprop='name']").text());
    
                const rating = $("[itemprop='contentRating']").attr("content");
                // duration
                const cleanUpDuration = R.trim;
                const duration = cleanUpDuration($($("[itemprop='duration']").get(0)).text());
                // genre
                const trimAndRemoveComma = R.compose(
                    R.replace(",", ""),
                    R.trim
                );
                const cleanTrimAndJoinChilds = R.compose(
                    R.join(", "),
                    R.map(trimAndRemoveComma)
                );
                const genre = cleanTrimAndJoinChilds($("span[itemprop='genre']").get().map(node => $(node).text()));
                const star = cleanTrimAndJoinChilds($("[itemprop='actors']").get().map(node => $(node).text()));
                // image
                const thumbnail = $('[itemprop="image"]').attr("src");
                // review star
                const reviewStar = $("[itemprop='ratingValue']").text();
                // description
                const description = R.trim($(".summary_text").text());
    
                resolve ({
                    imdb_id: id,
                    title: title,
                    year: year,
                    duration: duration,
                    genre: genre,
                    rating: rating,
                    description: description,
                    reviewStar: reviewStar,
                    star: star,
                    thumbnail_url: thumbnail
                })
            })
            .catch(e => {
                reject(e);  
            });
        });
    }
}