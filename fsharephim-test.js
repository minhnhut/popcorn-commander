const FSharePhim =  require("./app/src/support/FSharePhim.js");

FSharePhim.search("I kill giants").then(url => {
    console.log(url);
    const filter720pOnly = (link) => {
        return link.quality.indexOf("720p") !== -1 && link.filename.toLowerCase().indexOf("bluray") !== -1;
    }
    FSharePhim.getByUrl(url, filter720pOnly).then(links => {
        console.log(links);
        FSharePhim.getFshareUrl(links[0].download_url).then(url => {
            console.log(url);
        });
    })
});