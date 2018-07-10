<template>
    <b-modal
        ref="manualInsertModal"
        title="Insert new movie"
        size="lg"
        :ok-disabled="movie === null"
        ok-title="Add movie"
        @ok="handleOkClicked">
        <b-row>
            <b-col>
                <b-nav-form>
                    <b-input-group class="mr-2">
                        <b-input-group-text slot="prepend">
                            <font-awesome-icon icon="search" />
                        </b-input-group-text>
                        <b-form-input v-model="searchName" type="text" placeholder="Name ..."></b-form-input>
                    </b-input-group>
                </b-nav-form>
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
                </b-col>
            </b-row>
        </b-card>
    </b-modal>
</template>

<script>

import Imdb from "../support/ImdbMock"
import MovieGridView from "./MovieGridView.vue"

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
        searchName: "gt",
        movies: [],
        movie: null
    }),
    methods: {
        show() {
            this.$refs.manualInsertModal.show();
        },
        search() {
            this.movie = null;
            Imdb.search(this.searchName)
            .then(movies => {
                this.movies = movies;
            })
        },
        selectMovie(movie) {
            this.movie = movie;
        },
        handleOkClicked() {
            this.$emit("movie-select", this.movie);
        }
    }
}
</script>
