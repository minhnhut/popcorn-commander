<template>
    <b-modal
        ref="modal"
        title="Insert new movie"
        size="lg"
        :hide-footer="true"
    >
        <p class="text-right">
            <b-btn @click="fetchDownloadLinks" variant="secondary"><font-awesome-icon icon="sync" /> Reload</b-btn>
        </p>
        <b-row>
            <b-col>
                <p class="text-center" v-if="searchLoading">
                    <font-awesome-icon icon="spinner" spin /> loading ...
                </p>
                <table class="table table-bordered" v-else>
                    <thead>
                        <tr>
                            <th>Server</th>
                            <th>Filename</th>
                            <th width="100">Size</th>
                            <th width="150">Quality</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody :key="index" v-for="(download, index) in internalDownloads">
                        <tr>
                            <td>{{download.server}}</td>
                            <td>{{download.filename}}</td>
                            <td>{{download.size}}</td>
                            <td>{{download.quality}}</td>
                            <td>
                                <b-btn variant="primary">
                                    <font-awesome-icon icon="download" @click="handleDownloadClicked(download, index)" />
                                </b-btn>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </b-col>
        </b-row>
    </b-modal>
</template>

<script>

import LinkFinder from "../support/FshareLinkFinder"
var shell = require('electron').shell;

export default {
    props: {
        
    },
    data: () => ({
        internalDownloads: [],
        searchLoading: false,
        movie: Object,
        isDirty: false
    }),
    methods: {
        show(movie) {
            this.internalDownloads = movie.downloads;
            this.movie = movie;
            this.isDirty = false;
            if (!this.internalDownloads) {
                this.fetchDownloadLinks();
            }
            this.$refs.modal.show();
        },
        fetchDownloadLinks() {
            this.isDirty = true;
            this.searchLoading = true;
            LinkFinder.getFshareUrlForMovie(this.movie).then(links => {
                this.internalDownloads = links;
                this.searchLoading = false;
            });
        },
        handleDownloadClicked(download, index) {
            this.$emit("commit-downloads", {
                movie: this.movie,
                downloads: this.internalDownloads,
                selectedDownload: download,
                index: index,
                isDirty: this.isDirty
            });
            this.$refs.modal.hide();
        },
    }
}
</script>
