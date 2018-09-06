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

                // new
                const json = JSON.parse($('script[type="application/ld+json"]').html());
    
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
                const title = cleanUpTitle($("h1").text());
    
                const rating = json.contentRating; //$("[itemprop='contentRating']").attr("content");
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
                const genre = json.genre.join(', '); //cleanTrimAndJoinChilds($(".subtext a").get().filter(a => a.href.indexOf('/genre/') !== -1).map(node => $(node).text()));
                const star = R.map(x => x.name, json.actor).join(', '); // cleanTrimAndJoinChilds($("[itemprop='actors']").get().map(node => $(node).text()));
                // image
                const thumbnail = json.image; //$('[itemprop="image"]').attr("src");
                // review star
                const reviewStar = json.aggregateRating.ratingValue;//$(".ratingValue span").text();
                // description
                const description = R.trim($(".summary_text").text());

                let movie = {
                    imdb_id: id,
                    title: title,
                    year: year,
                    duration: duration,
                    genre: genre,
                    rating: rating,
                    description: description,
                    reviewStar: reviewStar,
                    star: star,
                    thumbnail_url: thumbnail,
                    trailer_url: ""
                };

                const trailerPageUrl = $("[itemprop='trailer']").attr('href');
                if (trailerPageUrl) {
                    movie.trailer_url =  "https://www.imdb.com" + trailerPageUrl;
                    // this.getTrailerMp4Url(trailerPageUrl)
                    // .then(url => {
                    //     movie.trailer_url = url;
                    //     resolve(movie);
                    // }).catch(() => {
                    //     // something wrong, forget it
                    //     resolve(movie);
                    // });
                }
                resolve(movie);
            })
            .catch(e => {
                reject(e);  
            });
        });
    },
    getTrailerMp4Url(trailerUrl) {
        return new Promise((resolve, reject) => {
            axios.get("https://www.imdb.com" + trailerUrl)
            .then(res => {
                const getVideoUrl = R.match(/\[{"definition":"360p","mimeType":"video\/mp4","videoUrl":"(.*?)"}/);
                const result = getVideoUrl(res.data);
                console.log(result);
                resolve(result.length == 2 ? result[1] : "");
            })
            .catch(reject)
        });
    }
}