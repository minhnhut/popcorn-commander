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
            const result = {"v":1,"q":"baymax","d":[{"l":"Big Hero 6","id":"tt2245084","s":"Ryan Potter, Scott Adsit","y":2014,"q":"feature","vt":43,"i":["https://m.media-amazon.com/images/M/MV5BMDliOTIzNmUtOTllOC00NDU3LWFiNjYtMGM0NDc1YTMxNjYxXkEyXkFqcGdeQXVyNTM3NzExMDQ@._V1_.jpg",1984,2835],"v":[{"l":"Trailer #2","id":"vi513650457","s":"2:37","i":["https://m.media-amazon.com/images/M/MV5BMTQ2NTEwNDcxOF5BMl5BanBnXkFtZTgwNDg0NTMzMzE@._V1_.jpg",1280,532]},{"l":"\"Hello, I Am Baymax\"","id":"vi945466393","s":"2:01","i":["https://m.media-amazon.com/images/M/MV5BMTU4Mzk0NzA4Ml5BMl5BanBnXkFtZTgwNDczOTYyMzE@._V1_.jpg",1280,532]},{"l":"Trailer #1","id":"vi3839339545","s":"2:28","i":["https://m.media-amazon.com/images/M/MV5BNzY5MzcxMjMzM15BMl5BanBnXkFtZTgwNTM1ODAyMjE@._V1_.jpg",640,480]}]},{"l":"Big Hero 6 The Series","id":"tt5515212","s":"Scott Adsit, Ryan Potter","y":2017,"q":"TV series","i":["https://m.media-amazon.com/images/M/MV5BMjE5OTQyMDg3NV5BMl5BanBnXkFtZTgwNjMxODg5ODE@._V1_.jpg",600,900]},{"l":"Big Hero 6: Bot Fight","id":"tt5543538","y":2014,"q":"video game"},{"l":"Lindsay Maxwell","id":"nm1535265","s":"Actress, Good Luck Chuck (2007)","i":["https://m.media-amazon.com/images/M/MV5BNjE1MDNkZDgtOTU2Mi00NWEzLWE3YWMtYjBkNDNhM2Y3ZTk4XkEyXkFqcGdeQXVyMjY3MjA0NQ@@._V1_.jpg",640,639]},{"l":"Valeria y Maximiliano","id":"tt0212706","s":"Leticia CalderÃ³n, Juan Ferrara","y":1991,"q":"TV series","i":["https://m.media-amazon.com/images/M/MV5BYTRlNjE3YjctNDQ1My00ZjIzLTgzMGItY2VjNjQ3ZTg0Y2U2XkEyXkFqcGdeQXVyMTk4MDgwNA@@._V1_.jpg",749,982]},{"l":"1993 Bombay March 12","id":"tt1886449","s":"Mammootty, Roma","y":2011,"q":"feature","i":["https://m.media-amazon.com/images/M/MV5BNjljZGFlODctODU2MC00OWU4LWFjYzMtM2Q1OTYxYzc4YTI5XkEyXkFqcGdeQXVyMjkxNzQ1NDI@._V1_.jpg",520,693]},{"l":"Bombay Mail","id":"tt0024904","s":"Edmund Lowe, Ralph Forbes","y":1934,"q":"feature","i":["https://m.media-amazon.com/images/M/MV5BN2E3ZGU0ODctMDM2ZC00ZDg5LTk5MjItMzU5OTUxMGYxZWY5XkEyXkFqcGdeQXVyMDMxMjQwMw@@._V1_.jpg",448,380]},{"l":"Antony Bayman","id":"nm2521455","s":"Sound Department, Kick-Ass (2010)"}]};
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
                R.prop("d")
            );
            const data = parseData(result);
            resolve(data);
        });
    }
}