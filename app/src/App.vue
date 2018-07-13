<template>
    <div id='app'>
        <nav-bar @add-new-click="showManualInsertModal" />
        <b-row>
            <div class="detail p-1 table-dark">
                <movie-detail :movie="movie" v-if="movie" />
            </div>
            <div class="grid bg-light">
                <movie-grid-view :movies="movies" :selected-movie="movie" @item-click="viewMovieDetail" @download-click="updateDownloadLinkForMovie" />
            </div>
        </b-row>
                
        <manual-insert-modal ref="manualInsertModal" @movie-select="insertMovie" />
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
    import { ipcRenderer } from 'electron'
    import DataLayer from './dal/DataLayer'
    import Vue from 'vue'
    import FSharePhim from './support/FSharePhim'
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
            ManualInsertModal
        },
        data: () => ({
            search: "",
            movies: [],
            stats: {
                total: 0,
                downloaded: 0
            },
            movie: null
        }),
        watch: {
            search: function()  {
                console.log(this.search);
                this.test();
            }
        },
        mounted() {
            // this.showManualInsertModal();
            this.loadData();
        },
        methods: {
            link(url) {
                shell.openExternal(url)
            },
            loadData() {
                DataLayer.exec(Db => {
                    const Movie = Db.getEntity("Movie");
                    Movie.findAndCountAll({
                        where: {
                            title: {
                                ":like": this.search + "%"
                            }
                        },
                        order: [
                            ["createdAt", "desc"]
                        ]
                    }).then(result => {
                        this.stats.total = result.count;
                        this.movies = result.rows;
                    });
                    // Db.getRepository("Movie").findAll({
                    //     where: {
                    //         title: this.search
                    //     }
                    // }).then(data => {
                    //     this.result = data;
                    // });
                });
            },
            viewMovieDetail(movie) {
                if (this.movie) {
                    this.movie._rowVariant = "";
                }
                Vue.set(movie, "_rowVariant", "active");
                // movie._rowVariant = "info";
                this.movie = movie;
            },
            showManualInsertModal() {
                this.$refs.manualInsertModal.show();
            },
            insertMovie(movie) {
                DataLayer.exec(Db => {
                    const Movie = Db.getEntity("Movie");
                    delete movie.id; // make sure movie doesn't have any id
                    Movie.findOne({where: {imdb_id: movie.imdb_id}}).then(dbMovie => {
                        if (dbMovie) {
                            dbMovie.update(movie).then(() => {
                                this.notySuccess(`${dbMovie.title} - Updated`, `${dbMovie.title} has been updated`);
                                this.loadData();
                            });
                        } else {
                            Movie.create(movie).then(() => {
                                this.notySuccess(`${dbMovie.title} - Created`, "New movie has been added to the collection");
                                this.loadData();
                            });
                        }
                    });
                    //Movie.create(movie).then(() => this.loadData());
                });
            },
            updateDownloadLinkForMovie(movie) {
                const filter720pOnly = (link) => {
                    return link.quality.indexOf("720p") !== -1 && link.filename.toLowerCase().indexOf("bluray") !== -1;
                }
                FSharePhim.search(movie.title).then(url => {
                    FSharePhim.getByUrl(url, filter720pOnly).then(links => {
                        FSharePhim.getFshareUrl(links[0].download_url).then(url => {
                            console.log("Found Fshare link: " + url);
                            // prepare link data
                            const link = links[0];
                            link.download_url = url;
                            link.movie_id = movie.id;
                            const notySuccess = () => this.notySuccess(`${movie.title} - Updated`, "Fetched FShare link successfully from Fsharephim.com.");
                            
                            DataLayer.exec(Db => {
                                const Download = Db.getEntity("Download");
                                Download.findOne({where: {download_url: url}})
                                .then(downloadRecord => {
                                    if (!downloadRecord) {
                                        Download.create(link).then(() => {
                                            notySuccess();
                                        });
                                    } else {
                                        notySuccess();
                                    }
                                })
                            });
                        });
                    })
                });
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
    
</style>

