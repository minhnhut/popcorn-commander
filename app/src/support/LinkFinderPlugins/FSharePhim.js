const axios = require("axios")
const R = require("ramda")
const cheerio = require("cheerio")
const {tryOrDefault} = require("tryordefault")

module.exports = {
    search(titleToSearch) {
        return new Promise((resolve, reject) => {
            axios.get('https://fsharephim.com/?s='+titleToSearch)
            .then(res => {
                const $ = cheerio.load(res.data);
                $(".result-item .title a").each(function() {
                    if ($(this).text().toLowerCase() == titleToSearch.toLowerCase()) {
                        const detailUrl = $(this).attr('href');
                        resolve(detailUrl);
                        return false;
                    }
                });
                resolve("not_found");
            })
            .catch(e => {
                reject(e);  
            });
            
        });
    },
    getByUrl(detailUrl, priorityFilter)
    {
        return new Promise((resolve, reject) => {
            axios.get(detailUrl)
            .then(res => {
                const $ = cheerio.load(res.data);
                let rawLinks = [];
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
                $(".links_table .fix-table table tbody tr").each(function() {
                    const downloadLinkTag = $($(this).find("td").get(0)).find("a");
                    const serverType = $($(this).find("td").get(1)).text().trim();
                    const filename = $($(this).find("td").get(2)).text();
                    const quality = $($(this).find("td").get(3)).text();
                    // make sure it is fshare, and didn't metion anything about subtitle
                    if (serverType == "fshare.vn" &&
                        quality.toLowerCase().indexOf("subtitle") === -1) {
                        const link = {
                            source: "FsharePhim",
                            raw_url: downloadLinkTag.attr("href"),
                            size: downloadLinkTag.find(".face-secondary").text(),
                            filename: filename,
                            quality: quality,
                            server: "fshare"
                        };
                        rawLinks.push(cleanUpLinkObject(link));
                    }
                });
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
                processedAllLinks = calculateSizeValues(rawLinks);
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
                reject(e);  
            });
        });
    },
    getFshareUrl(downloadLink) {
        return new Promise((resolve, reject) => {
            axios.get(downloadLink)
            .then(res => {
                const $ = cheerio.load(res.data);
                resolve($(".boton.reloading a").attr("href"));
            })
            .catch(e => {
                reject(e);
            });
        });
    },
    getFshareUrlForMovie(movie, filter) {
        return new Promise((resolve, reject) => {
            this.search(movie.title).then(url => {
                if (url === "not_found") {
                    resolve(null);
                } else {
                    this.getByUrl(url, filter).then(links => {
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
                        const attachMovieIdToLinkArray = R.map(x => {
                            x.movie_id = movie.id
                            return x;
                        });
                        const allPromises = getFshareUrlAll(links);
                        Promise.all(allPromises).then(links => {
                            links = links.filter(link => !!link);
                            resolve(links);
                        }).catch(reject);
                    }).catch(reject);
                }
            }).catch(reject);
        });
    }
}