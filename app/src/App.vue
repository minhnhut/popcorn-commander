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
                    @fetch-download-click="openDownloadSelectorModal"
                    @download-click="startMovieDownload"
                    @remove-click="showRemoveConfirm" />
            </div>
        </b-row>
                
        <manual-insert-modal ref="manualInsertModal" @movie-select="insertMovie" />
        <remove-movie-modal ref="removeConfirmModal" @ok="removeMovie" />
        <download-selector-modal ref="downloadSelectorModal" @commit-downloads="updateMovieDownloadLinks" />
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
    import DownloadSelectorModal from "./components/DownloadSelectorModal.vue"
    import { ipcRenderer } from 'electron'
    import DataLayer from './backend/DataLayer'
    import Downloader from './backend/Downloader'
    import Vue from 'vue'
    // import FShareLinkFinder from './support/FshareLinkFinder'
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
            RemoveMovieModal,
            DownloadSelectorModal
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
                // console.log(downloadPool);
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
                                });
                            });
                            this.movies.forEach((thisMovie,index) => {
                                movies.forEach(newMovie => {
                                    if (thisMovie.id == newMovie.id) {
                                        new Notification('Title', {
                                            body: 'Lorem Ipsum Dolor Sit Amet'
                                        })
                                        Vue.set(this.movies, index, newMovie);
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
                    delete movie.id; // make sure movie doesn't have any id
                    Movie.findOne({where: {imdb_id: movie.imdb_id}}).then(dbMovie => {
                        if (dbMovie) {
                            dbMovie.update(movie).then(() => {
                                this.notySuccess(`${movie.title} - Updated`, `${dbMovie.title} has been updated`);
                                this.loadData();
                            });
                        } else {
                            Movie.create(movie).then((movie) => {
                                if (downloads) {
                                    this.updateDownloadLinks(movie, downloads);
                                }
                                this.notySuccess(`${movie.title} - Created`, "New movie has been added to the collection");
                                this.loadData();
                            });
                        }
                    });
                });
            },
            updateDownloadLinks(movie, downloads) {
                DataLayer.exec(Db => {
                    const Download = Db.getEntity("Download");
                    const bulkCreateDownloads = R.forEach(download => {
                        download.movie_id = movie.id;
                        Download.create(download);
                    });
                    Download.destroy({where: {movie_id: movie.id}}).then(() => {
                        bulkCreateDownloads(downloads);
                    })
                });
            },
            startMovieDownload(movie) {
                Vue.set(movie, "_loading", true);
                // console.log(movie.current_download_id);
                if (movie.current_download_id) {
                    const selectedDownload = R.filter(x => x.id = movie.current_download_id, movie.downloads);
                    if (selectedDownload[0]) {
                        const download = selectedDownload[0];
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
                        return;
                    }
                } else {
                    this.notyError(movie.title, "No download link found. Let's fetch it first.")
                }
            },
            openDownloadSelectorModal(movie) {
                this.$refs.downloadSelectorModal.show(movie);
            },
            updateMovieDownloadLinks({movie, downloads, selectedDownload, index, isDirty}) {
                Vue.set(movie, "_loading", true);
                DataLayer.exec(Db => {
                    const Movie = Db.getEntity("Movie");
                    const Download = Db.getEntity("Download");
                    // console.log("dirty: " + isDirty);
                    if (isDirty) {
                        downloads[index].the_choosen = true;
                        Vue.set(movie, "downloads", downloads);
                        const bulkCreateDownloads = R.forEach(download => {
                            download.movie_id = movie.id;
                            download.direct_url = "";
                            Download.create(download).then(dbDownload => {
                                movie.downloads[index].id = dbDownload.id;
                                if (download.the_choosen) {
                                    Movie.update({current_download_id: dbDownload.id}, {where: {id: movie.id}});
                                    // Vue.set(movie, "current_download_id", dbDownload.id);
                                    movie.current_download_id = dbDownload.id;
                                    this.startMovieDownload(movie);
                                }
                            });
                        });
                        Download.destroy({where: {movie_id: movie.id}}).then(() => {
                            Movie.update({is_downloaded: 0, current_download_id: null}, {where: {id: movie.id}});
                            // no need to wait, lets change it locally
                            Vue.set(movie, "is_downloaded", false);
                            Vue.set(movie, "current_download_id", null);
                            Vue.set(movie, "_loading", false);
                            bulkCreateDownloads(downloads);
                        });
                    } else {
                        const currentMovieId = downloads[index].id;
                        Movie.update({current_download_id: currentMovieId}, {where: {id: movie.id}});
                        Download.update({direct_url:null}, {where: {id: currentMovieId}});
                        Vue.set(movie, "current_download_id", currentMovieId);
                        Vue.set(downloads[index], "direct_url", null);
                        this.startMovieDownload(movie);
                    }
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

