<template>
    <div id='app'>
        <nav-bar @add-new-click="showManualInsertModal" />
        <b-row>
            <div class="detail p-1 table-dark">
                <movie-detail :movie="movie" v-if="movie" />
            </div>
            <div class="grid bg-light">
                
                <movie-grid-view :movies="movies" :selected-movie="movie" @item-click="viewMovieDetail" />
            </div>
        </b-row>
                
        <manual-insert-modal ref="manualInsertModal" @movie-select="insertMovie" />
        
        <bottom-status-bar :downloaded="stats.downloaded" :total="stats.total" />
    </div>
</template>

<script>
    import BottomStatusBar from "./components/BottomStatusBar.vue"
    import MovieGridView from "./components/MovieGridView.vue"
    import MovieDetail from "./components/MovieDetail.vue"
    import NavBar from "./components/NavBar.vue"
    import ManualInsertModal from "./components/ManualInsertModal.vue"
    import { ipcRenderer } from 'electron'
    import DataLayer from './dal/DataLayer'
    import Vue from 'vue'
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
            this.showManualInsertModal();
            this.loadData();
        },
        methods: {
            link(url) {
                shell.openExternal(url)
            },
            insert() {
                DataLayer.exec(Db => {
                    const Movie = Db.getEntity("Movie");
                    Movie.create({
                        title: this.search,
                        year: "now"
                    });
                })
            },
            loadData() {

                DataLayer.exec(Db => {
                    const Movie = Db.getEntity("Movie");
                    Movie.findAll({
                        where: {
                            title: {
                                ":like": this.search + "%"
                            }
                        }
                    }).then(data => {
                        this.movies = data
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
                    Movie.create(movie);
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
    }

    .grid {
        position: fixed;
        left: 200px;
        right: 0;
        bottom: 25px;
        top: 56px;
        overflow-y: scroll;
    }
</style>
