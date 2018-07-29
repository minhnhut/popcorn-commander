const axios = require("axios")
const R = require("ramda")
const cheerio = require("cheerio")
const {tryOrDefault} = require("tryordefault")

module.exports = {
    search(titleToSearch, priorityFilter) {
        const searchRaw = R.curry(this.searchRaw);
        const searchByHost = searchRaw(titleToSearch, priorityFilter);
        return new Promise(
            (resolve) => Promise.all([
                searchByHost('fshare'),
                searchByHost('4share')
            ]).then(
                linkGroups => resolve(R.apply(R.concat, linkGroups))
            )
        );
    },
    searchRaw(titleToSearch, priorityFilter, host) {
        return new Promise((resolve, reject) => {
            axios.get('http://www.taifile.net/search.php?q='+encodeURIComponent(titleToSearch)+'&host=' + host)
            .then(res => {
                const $ = cheerio.load(res.data);
                const trimProp = R.compose(
                    R.trim,
                    R.prop
                );
                const cleanUpLinkObject = (object) => {
                    R.forEach(
                        (key) => object[key] = trimProp(key, object),
                        R.keys(object)
                    )
                    return object;
                }
                let rawLinks = [];
                const keywords = titleToSearch.toLowerCase().replace("-", "")
                    .replace("@", "")
                    .replace("(", "")
                    .replace(")", "")
                    .split(" ")

                $(".bgframe").each(function() {
                    const filename = $(this).find('.rsl_1 a').text();
                    const lowerCaseFileName = filename.toLowerCase();
                    
                    const nameNotMatched = keywords.some(keyword => {
                        return lowerCaseFileName.indexOf(keyword) === -1;
                    });
                    if (nameNotMatched) return;

                    const raw_url = $(this).find('.rsl_1 a').attr('href');
                    
                    const guessQualityFromName = (filename) => {
                        filename = filename.toLowerCase();
                        if (filename.indexOf("720p") !== -1) return "720p";
                        else if (filename.indexOf("1080p") !== -1) return "1080p";
                        else if (filename.indexOf("bluray") !== -1) return "Bluray";
                        else return "Unknown";
                    }

                    const quality = guessQualityFromName(filename);
                    const size = $($(this).find(".rsl_info b").get(1)).text();

                    const link = {
                        source: "TaiFile",
                        raw_url,
                        size,
                        filename,
                        quality,
                        server: host
                    };
                    rawLinks.push(cleanUpLinkObject(link));
                });
                // console.log(rawLinks);

                const getTwoParts = R.split(" ");
                const convertTextToValue = x => {
                    switch (x) {
                        case "GB": return 10000000;
                        case "MB": return 1000;
                        case "KB": return 10;
                        default: return x;
                    }
                }
                const calculateValueFromSize = R.compose(
                    R.apply(R.multiply),
                    R.map(parseFloat),
                    R.map(x => convertTextToValue(x)),
                    getTwoParts,
                    R.trim
                    // R.prop("size")
                );

                const calculateSizeValues = R.map(x => {
                    x.size_value = calculateValueFromSize(x.size);
                    return x;
                });
                const sortBySizeAsc = R.sort((a,b) => { return a.size_value - b.size_value});
                const processedAllLinks = calculateSizeValues(rawLinks);

                let links = [];
                if (priorityFilter) {
                    const filterThenSortBySize = R.compose(sortBySizeAsc, R.filter(priorityFilter));
                    links = filterThenSortBySize(processedAllLinks);
                }
                if (links.length == 0) {
                    links = sortBySizeAsc(processedAllLinks);
                }
                resolve(links);
            })
            .catch(e => {
                resolve([]);  
            });
            
        });
    },
    getFshareUrl(url) {
        return new Promise((resolve, reject) => {
            axios.get('http://www.taifile.net' + url)
            .then(res => {
                if (res.request.responseURL) resolve(res.request.responseURL);
                else if (res.request.res && res.request.res.responseUrl) resolve(res.request.res.responseUrl);
                else reject("unknown resquest object");
            })
            .catch(reject);
        });
    },
    getFshareUrlForMovie(movie, filter) {
        return new Promise((resolve, reject) => {
            this.search(movie.title, filter).then(links => {
                const parseRealUrl = x => new Promise(
                    resolve => {
                        this.getFshareUrl(x.raw_url)
                            .then(url => {
                                x.download_url=url;
                                resolve(x);
                            })
                            .catch(() => resolve(null))
                    }
                );
                const getFshareUrlAll = R.map(parseRealUrl);
                const allPromises = getFshareUrlAll(links);
                Promise.all(allPromises).then(links => {
                    links = links.filter(link => !!link);
                    resolve(links);
                }).catch(reject);
            }).catch(reject);
        });
    }
}