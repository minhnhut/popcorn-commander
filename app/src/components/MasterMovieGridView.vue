<template>
    <b-table fixed small bordered hover :outlined="false" :fields="fields" :items="movies" thead-class="d-none" class="table-movie" @row-clicked="handleRowClicked">
        <template slot="thumbnail" slot-scope="data">
            <img :src="data.item.thumbnail_url" alt="" width="50" height="73">
        </template>
        <template slot="title" slot-scope="data">
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
        getDownloader(movie) {
            if (this.downloadPool && this.downloadPool[movie.id]) {
                return this.downloadPool[movie.id];
            }
            return null;
        },
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
    .toolbar {
        position: absolute;
        right: 10px;
        top: 0;
        bottom: 0;
        padding: 18px 0;
        display: none;
    }
</style>
