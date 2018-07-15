<template>
    <b-table fixed small bordered hover :outlined="false" :fields="fields" :items="movies" thead-class="d-none" class="table-movie" @row-clicked="handleRowClicked">
        <template slot="thumbnail" slot-scope="data">
            <img :src="data.item.thumbnail_url" alt="" width="50" height="73">
        </template>
        <template slot="title" slot-scope="data">
            <h6>{{data.item.title}} <small v-if="data.item.year">({{data.item.year}})</small></h6>
            <p><font-awesome-icon icon="users" /> {{displayStars(data.item)}}</p>
            <p>{{ displayStatus(data.item) }}</p>
            <template v-if="data.item.downloader && data.item.downloader.progress">
                <p>{{data.item.downloader.progress.percent}}% - {{displayHumanReadableSpeed(data.item.downloader.progress.bytesPerSecond)}}</p>
                <b-progress height="2px" :value="data.item.downloader.progress.percent" :max="100" class="mb-3"></b-progress>
            </template>
            <div class="toolbar">
                <template v-if="data.item.downloads">
                    <b-btn variant="primary" @click.stop="handleDownloadClick(data.item)"><font-awesome-icon icon="play" /></b-btn>
                    <b-btn variant="default" @click.stop="handleFetchDownloadUrl(data.item)"><font-awesome-icon icon="sync" /></b-btn>
                </template>
                <template v-else>
                    <b-btn variant="primary" @click.stop="handleFetchDownloadUrl(data.item)"><font-awesome-icon icon="download" /></b-btn>
                </template>
            </div>
        </template>

    </b-table>
</template>

<script>
const R = require("ramda")
import Vue from "vue"
import MovieGridView from "./MovieGridView.vue"
const {utils} = require("rapid-downloader")

export default {
    extends: MovieGridView,
    methods: {
        displayStatus: R.compose(
            R.defaultTo(""),
            R.prop('status')
        ),
        handleDownloadClick(movie) {
            this.$emit("download-click", movie);
        },
        handleFetchDownloadUrl(movie) {
            this.$emit("fetch-download-click", movie);
        },
        displayHumanReadableSpeed: utils.dynamicSpeedUnitDisplay
    }
}
</script>

<style>
    .table-movie tr td {
        position: relative;
    }
    .table-movie tr:hover .toolbar {
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
