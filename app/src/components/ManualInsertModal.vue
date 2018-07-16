<template>
    <b-modal
        ref="manualInsertModal"
        title="Insert new movie"
        size="lg"
        :ok-disabled="movie === null || detailLoading"
        ok-title="Add movie"
        @ok="handleOkClicked">
        <b-row>
            <b-col>
                    <b-input-group class="mr-2">
                        <b-input-group-text slot="prepend">
                            <font-awesome-icon icon="search" />
                        </b-input-group-text>
                        <input class="form-control" ref="input" v-model="searchName" type="text" placeholder="Name ..." />
                    </b-input-group>
            </b-col>
        </b-row>
        <b-row class="mt-2" v-if="!movie">
            <b-col>
                <movie-grid-view :movies="movies" @item-click="selectMovie" />
            </b-col>
        </b-row>
        <b-card
            class="mt-2"
            v-else
            header="Selected movie"
            header-text-variant="white"
            header-tag="header"
            header-bg-variant="dark">
            <b-row>
                <b-col cols="3">
                    <b-img :src="movie.thumbnail_url" fluid />
                </b-col>
                <b-col>
                    <h3>{{movie.title}}</h3>
                    <template v-if="detailLoading">
                        <p class="text-center">
                            <font-awesome-icon icon="sun" spin /> Loading detail ...
                        </p>
                    </template>
                    <template v-else>
                        <p>{{movie.description}}</p>
                        <b-btn v-if="movie.trailer_url" @click="openTrailer" variant="warning"><font-awesome-icon icon="play" /> Watch trailer</b-btn>
                        <p><strong>Genre</strong>: {{movie.genre}}</p>
                        <p><strong>Stars</strong>: {{movie.star}}</p>

                        <p v-if="lookingForDownload"><font-awesome-icon icon="sun" spin /> Looking for fshare links ...</p>
                        <template v-else>
                            <p v-if="downloads.length" class="text-success"><font-awesome-icon icon="check" /> Found link for this movie on FSharePhim</p>
                            <p v-else class="text-danger"><font-awesome-icon icon="times" /> Link for this movie can not be found</p>
                        </template>
                    </template>
                </b-col>
            </b-row>
        </b-card>
    </b-modal>
</template>

<script>

import Imdb from "../support/Imdb"
import MovieGridView from "./MovieGridView.vue"
import FSharePhim from "../support/FSharePhim"
var shell = require('electron').shell;

export default {
    components: {
        MovieGridView
    },
    watch: {
        searchName() {
            if (this.searchCooldown) {
                window.clearTimeout(this.searchCooldown);
            }
            this.searchCooldown = window.setTimeout(this.search, 200);
        }
    },
    mounted() {
        this.search();
    },
    data: () => ({
        searchCooldown: null,
        searchName: "",
        movies: [],
        movie: null,
        detailLoading: false,
        lookingForDownload: false,
        downloads: []
    }),
    methods: {
        show() {
            this.$refs.manualInsertModal.show();
            window.setTimeout(() => {
                this.$refs.input.focus();
            }, 100);
        },
        search() {
            this.movie = null;
            this.movies = [];
            if (this.searchName) {
                Imdb.search(this.searchName)
                .then(movies => {
                    this.movies = movies;
                });
            }
        },
        selectMovie(movie) {
            this.movie = movie;
            this.downloads = [];
            this.lookingForDownload = true;
            FSharePhim.getFshareUrlForMovie(movie).then(link => {
                this.downloads.push({
                    "source": "FsharePhim",
                    link
                });
                this.lookingForDownload = false;
            })
            .catch(() => {
                // should I do something? nope
                this.lookingForDownload = false;
            });
            this.detailLoading = true;
            Imdb.getById(movie.imdb_id).then(movie => {
                this.movie = movie;
                this.detailLoading = false;
            }).catch(e => {
                console.log(e);
            });
        },
        handleOkClicked() {
            this.$emit("movie-select", this.movie);
        },
        openTrailer() {
            shell.openExternal(this.movie.trailer_url);
        }
    }
}
</script>
