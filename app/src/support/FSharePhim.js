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
                reject("Not found");
            })
            .catch(e => {
                reject(e);  
            });
            
        });
    },
    getByUrl(detailUrl)
    {
        return new Promise((resolve, reject) => {
            axios.get(detailUrl)
            .then(res => {
                const $ = cheerio.load(res.data);
                let links = [];
                $(".links_table .fix-table table tbody tr").each(function() {
                    const downloadLinkTag = $($(this).find("td").get(0)).find("a");
                    const serverType = $($(this).find("td").get(1)).text().trim();
                    const quality = $($(this).find("td").get(2)).text();
                    if (serverType == "fshare.vn") {
                        links.push({
                            downloadUrl: downloadLinkTag.attr("href"),
                            size: downloadLinkTag.text(),
                            quality: quality
                        });
                    }
                });
                console.log(links);
                const getTwoParts = R.split(" ");
                const convertTextToValue = x => {
                    switch (x) {
                        case "GB": return 1000;
                        case "MB": return 100;
                        case "KB": return 10;
                        default: return x;
                    }
                }
                const calculateValueFromSize = R.compose(
                    R.apply(R.multiply),
                    R.map(parseFloat),
                    R.map(x => convertTextToValue(x)),
                    getTwoParts,
                    R.prop("size")
                );
                const calculateSizeValues = R.map(x => {
                    x.sizeValue = calculateValueFromSize(x.size);
                });
                links = calculateSizeValues(links);
                R.sort((a,b) => { return a.sizeValue - b.sizeValue});
                // WIP
                // TODO find optimum filesize
            })
            .catch(e => {
                reject(e);  
            });
        });
    }
}