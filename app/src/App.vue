<template>
    <div id='app'>
        <nav-bar @search="handleNavBarSearch" @add-new-click="showManualInsertModal" />
        <b-row>
            <div class="detail p-1 table-dark">
                <movie-detail :movie="movie" v-if="movie" />
            </div>
            <div class="grid bg-light">
                <movie-grid-view
                    :movies="movies"
                    :selected-movie="movie"
                    :download-pool="downloadPool"
                    @item-click="viewMovieDetail"
                    @fetch-download-click="updateMovieDownloadLink"
                    @download-click="startMovieDownload"
                    @remove-click="showRemoveConfirm" />
            </div>
        </b-row>
                
        <manual-insert-modal ref="manualInsertModal" @movie-select="insertMovie" />
        <remove-movie-modal ref="removeConfirmModal" @ok="removeMovie" />
        <notifications group="notification" position="bottom right" class="main-notification" />
        <bottom-status-bar :downloaded="stats.downloaded" :total="stats.total" />
    </div>
</template>

<script>
    import BottomStatusBar from "./components/BottomStatusBar.vue"
    import MovieGridView from "./components/MasterMovieGridView.vue"
    import MovieDetail from "./components/MovieDetail.vue"
    import NavBar from "./components/NavBar.vue"
    import ManualInsertModal from "./components/ManualInsertModal.vue"
    import RemoveMovieModal from "./components/RemoveMovieModal.vue"
    import { ipcRenderer } from 'electron'
    import DataLayer from './backend/DataLayer'
    import Downloader from './backend/Downloader'
    import Vue from 'vue'
    import FShareLinkFinder from './support/FshareLinkFinder'
    // import DownloadPool from './support/DownloadPool'
    const R = require('ramda')
    // import R from 'ramda'

    // With shell.openExternal(url) is how
    // external urls must be handled, not href
    const shell = require('electron').shell

    export default {
        components: {
            BottomStatusBar,
            MovieGridView,
            MovieDetail,
            NavBar,
            ManualInsertModal,
            RemoveMovieModal
        },
        data: () => ({
            search: "",
            searchCooldown: null,
            movies: [],
            stats: {
                total: 0,
                downloaded: 0
            },
            movie: null,
            downloadPool: {}
        }),
        mounted() {
            ipcRenderer.on("backend-update-link", (event, {downloadPool, needRefresh}) => {
                // this.downloadPool = downloadPool;
                console.log(downloadPool);
                Vue.set(this, "downloadPool", downloadPool);
                if (needRefresh && needRefresh.length) {
                    DataLayer.exec(Db => {
                        const Movie = Db.getEntity("Movie");
                        const Download = Db.getEntity("Download");
                        Movie.findAll({
                            where: {
                                id: {
                                    ":in": needRefresh
                                }
                            }
                        }).then(movies => {
                            const eagerLoad = R.forEach(movie => {
                                Download.findAll({where: {movie_id: movie.id}})
                                .then(downloads => {
                                    Vue.set(movie, "downloads", downloads)
                                    // movie.downloads = downloads
                                });
                            });
                            console.log(movies);
                            this.movies.forEach((thisMovie,index) => {
                                movies.forEach(newMovie => {
                                    if (thisMovie.id == newMovie.id) {
                                        Vue.set(this.movies, index, newMovie);
                                        // thisMovie = R.merge(thisMovie, newMovie);
                                    }
                                });
                            });
                        });
                    })
                }
            })
            this.loadData();
        },
        methods: {
            link(url) {
                shell.openExternal(url)
            },
            handleNavBarSearch(keywords) {
                this.search = keywords;
                if (this.searchCooldown) {
                    window.clearTimeout(this.searchCooldown);
                }
                this.searchCooldown = window.setTimeout(() => {
                    this.loadData();       
                },500)
            },
            loadData() {

                // make where clause from keywords
                let where = [];
                this.search.split(" ").forEach(keyword => {
                    where.push({title: {
                        ":like": "%" + keyword + "%"
                    }})
                })

                DataLayer.exec(Db => {
                    const Movie = Db.getEntity("Movie");
                    const Download = Db.getEntity("Download");
                    Movie.findAndCountAll({
                        where: {
                            ":or": where
                        },
                        order: [
                            ["createdAt", "desc"]
                        ]
                    }).then(result => {
                        this.stats.total = result.count;
                        this.movies = result.rows;
                        const eagerLoad = R.forEach(movie => {
                            Download.findAll({where: {movie_id: movie.id}})
                            .then(downloads => {
                                Vue.set(movie, "downloads", downloads)
                            });
                        });
                        eagerLoad(this.movies);
                    });
                });
            },
            viewMovieDetail(movie) {
                if (this.movie) {
                    this.movie._rowVariant = "";
                }
                if (movie) {
                    Vue.set(movie, "_rowVariant", "active");
                }
                this.movie = movie;
            },
            showManualInsertModal() {
                this.$refs.manualInsertModal.show();
            },
            insertMovie({movie, downloads}) {
                DataLayer.exec(Db => {
                    const Movie = Db.getEntity("Movie");
                    const Download = Db.getEntity("Download");
                    delete movie.id; // make sure movie doesn't have any id
                    Movie.findOne({where: {imdb_id: movie.imdb_id}}).then(dbMovie => {
                        if (dbMovie) {
                            dbMovie.update(movie).then(() => {
                                this.notySuccess(`${movie.title} - Updated`, `${dbMovie.title} has been updated`);
                                this.loadData();
                            });
                        } else {
                            Movie.create(movie).then((movie) => {
                                if (downloads && downloads[0]) {
                                    let download = downloads[0];
                                    download.movie_id = movie.id;
                                    Download.create(download);
                                }
                                this.notySuccess(`${movie.title} - Created`, "New movie has been added to the collection");
                                this.loadData();
                            });
                        }
                    });
                });
            },
            attachMovieDownloader(movie, download) {
                console.log("download: " + download.download_url);
                const startDownload = (directUrl) => {
                    Downloader.makeDownloaderFromDirectUrl(movie.id, directUrl);
                    Vue.set(movie, "_loading", false);
                }
                
                if (!download.direct_url) {
                    Downloader.getDirectUrlFromFshareUrl(download.download_url).then(directUrl => {
                        DataLayer.exec(Db => {
                            const Download = Db.getEntity("Download");
                            Download.update({direct_url: directUrl}, {where: {id: download.id}});
                        });
                        startDownload(directUrl);
                    });
                } else {
                    startDownload(download.direct_url);
                }
            },
            startMovieDownload(movie) {
                Vue.set(movie, "_loading", true);
                if (movie.downloads && movie.downloads[0]) {
                    this.attachMovieDownloader(movie, movie.downloads[0]);
                } else {
                    this.updateMovieDownloadLink(movie);
                }
            },
            updateMovieDownloadLink(movie) {
                Vue.set(movie, "_loading", true);
                DataLayer.exec(Db=> {
                    const Movie = Db.getEntity("Movie");
                    const Download = Db.getEntity("Download");
                    Download.findAll({where: {'movie_id': movie.id}})
                    .then(downloads => {
                        Movie.update({is_downloaded: 0}, {where: {id: movie.id}});
                        // no need to wait, lets change it locally
                        Vue.set(movie, "is_downloaded", false);
                        // Delete all previous downloads
                        Download.destroy({where: {movie_id: movie.id}}).then(() => {
                            // Get new fshare link
                            FShareLinkFinder.getFshareUrlForMovie(movie).then(links => {
                                if (links.length === 0) {
                                    this.notyError(movie.title, "Scanned all available sources. But no link was found.");
                                } else {
                                    const link = links[0];
                                    const url = link.download_url;
                                    const notySuccess = () => this.notySuccess(`${movie.title} - Updated`, "Looked and fetched new download link.");
                                    Download.create(link).then(() => {
                                        // Notify user that is is completed
                                        notySuccess();
                                        Download.findOne({where: {download_url: url}}).then(download => {
                                            // Let's download begin
                                            this.attachMovieDownloader(movie, download);
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            },
            showRemoveConfirm(movie) {
                this.$refs.removeConfirmModal.show(movie);
            },
            removeMovie(movie) {
                if (movie) {
                    DataLayer.exec(Db => {
                        const Movie = Db.getEntity("Movie");
                        const Download = Db.getEntity("Download");
                        Download.destroy({where: {movie_id: movie.id}});
                        Movie.destroy({where: {id: movie.id}});
                        this.loadData();
                        this.notySuccess(movie.title, "Removed from your collection");
                    });
                }
            },
            notyError(title, text) {
                this.$notify({
                    group: "notification",
                    type: "warn",
                    title: title,
                    text: text,
                });
            },
            notySuccess(title, text) {
                this.$notify({
                    group: "notification",
                    type: "success",
                    title: title,
                    text: text,
                });
            }
        }
    }
</script>

<style scoped>
    .detail {
        position: fixed;
        width: 200px;
        bottom: 25px;
        top: 56px;
        left: 0;
        border-right: 1px solid #000;
        overflow-y: scroll;
    }

    .grid {
        position: fixed;
        left: 200px;
        right: 0;
        bottom: 25px;
        top: 56px;
        overflow-y: scroll;
    }
    
    .main-notification {
        margin-bottom: 30px !important;
    }
</style>

<style>
    ::-webkit-scrollbar {
        width:  5px;
        height: 100%;
    }

    ::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background: var(--gray);
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }
</style>

