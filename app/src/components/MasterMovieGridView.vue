<template>
    <b-table fixed small bordered hover :outlined="false" :fields="fields" :items="processedItems" thead-class="d-none" class="table-movie mb-0" @row-clicked="handleRowClicked">
        <template slot="thumbnail" slot-scope="data" v-if="isMovie(data.item)">
            <img :src="data.item.thumbnail_url" alt="" width="50" height="73">
        </template>
        <template slot="title" slot-scope="data" v-if="isMovie(data.item)">
            <h6>{{data.item.title}} <small v-if="data.item.year">({{data.item.year}})</small> <font-awesome-icon v-if="data.item._loading" icon="sync" spin /></h6>
            <actors :movie="data.item" />
            <download-status :movie="data.item" :downloader="getDownloader(data.item)" />
            <toolbar
                :movie="data.item"
                @fetch-download-click="handleFetchDownloadUrl(data.item)"
                @start-download-click="handleDownloadClick(data.item)"
                @remove-click="handleRemove(data.item)"
            />
        </template>

    </b-table>
</template>

<script>
const R = require("ramda")
import Vue from "vue"
import MovieGridView from "./MovieGridView.vue"
import Actors from "./MasterMovieGrid/Actors.vue"
import DownloadStatus from "./MasterMovieGrid/DownloadStatus.vue"
import Toolbar from "./MasterMovieGrid/Toolbar.vue"

export default {
    extends: MovieGridView,
    components: {
        Actors,
        DownloadStatus,
        Toolbar
    },
    computed: {
        processedItems() {
            const neededBlankItemsNumber = 10 - this.movies.length;
            let result = this.movies;
            if (neededBlankItemsNumber > 0) {
                for (let i = 0; i < neededBlankItemsNumber; i++) result.push({_rowVariant: 'dummy'});
            }
            return result;
        }
    },
    props: {
        downloadPool: Object
    },
    methods: {
        handleDownloadClick(movie) {
            this.$emit("download-click", movie);
        },
        handleFetchDownloadUrl(movie) {
            this.$emit("fetch-download-click", movie);
        },
        handleRemove(movie) {
            this.$emit("remove-click", movie);
        },
        handleRowClicked(movie) {
            if (this.isMovie(movie)) {
                this.$emit("item-click", movie);
            } else {
                this.$emit("item-click", null);
            }
        },
        getDownloader(movie) {
            if (this.downloadPool && this.downloadPool[movie.id]) {
                return this.downloadPool[movie.id];
            }
            return null;
        },
        isMovie: (movie) => !!movie.id 
    }
}
</script>

<style>
    .table-movie tr td {
        position: relative;
    }
    .table-movie tr.table-active .toolbar, .table-movie tr:hover .toolbar {
        display: block;
    }
    .table-movie tr.table-dummy:hover .toolbar {
        display: none;
    }
    .table-movie tr.table-dummy:hover {
        background: transparent;
    }
    .table-movie tr.table-dummy {
        cursor: default;
    }
    .toolbar {
        position: absolute;
        right: 10px;
        top: 0;
        bottom: 0;
        padding: 18px 0;
        display: none;
    }
</style>
