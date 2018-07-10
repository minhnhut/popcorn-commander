<template>
    <div id='app'>
        <b-navbar variant="dark" type="dark">
            <b-navbar-brand>Commander</b-navbar-brand>
        </b-navbar>
        
        <b-row>
            <div class="detail p-1">
                <movie-detail :movie="movie" v-if="movie" />
            </div>
            <div class="grid">
                <movie-grid-view :movies="result" :selected-movie="movie" @item-click="viewMovieDetail" />
            </div>
        </b-row>
        
        <!-- <b-button variant="primary" @click="insert()">Test()</b-button> -->
        <bottom-status-bar :downloaded="stats.downloaded" :total="stats.total" />
    </div>
</template>

<script>
    import BottomStatusBar from "./components/BottomStatusBar.vue"
    import MovieGridView from "./components/MovieGridView.vue"
    import MovieDetail from "./components/MovieDetail.vue"
    import { ipcRenderer } from 'electron'
    import DataLayer from './dal/DataLayer'

    // With shell.openExternal(url) is how
    // external urls must be handled, not href
    const shell = require('electron').shell

    export default {
        components: {
            BottomStatusBar,
            MovieGridView,
            MovieDetail
        },
        data: () => ({
            search: "",
            result: [],
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
        created() {
            this.test();
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
          test() {

            DataLayer.exec(Db => {
                const Movie = Db.getEntity("Movie");
                Movie.findAll({
                    where: {
                        title: {
                            ":like": this.search + "%"
                        }
                    }
                }).then(data => {
                    this.result = data
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
            this.movie = movie;
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
        border-right: 1px solid #efefef;
    }

    .grid {
        position: fixed;
        left: 200px;
        right: 0;
        bottom: 25px;
        top: 56px;
    }
</style>
