<template>
    <b-modal
        class="modal-download-selector"
        ref="modal"
        title="Insert new movie"
        size="xl"
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
                <table class="table table-bordered table-hover table-sm" v-else>
                    <thead>
                        <tr>
                            <th>Files</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody :key="index" v-for="(download, index) in internalDownloads">
                        <tr>
                            <td>
                                <p class="mb-0">
                                    {{download.filename}}
                                </p>
                                <p class="mb-0">
                                    <b-badge variant="dark">{{download.server}}</b-badge>
                                    <b-badge variant="success">{{download.size}}</b-badge>
                                    <b-badge variant="warning">{{download.quality}}</b-badge>
                                </p>
                            </td>
                            <td>
                                <b-btn variant="primary" @click="handleDownloadClicked(download, index)">
                                    <font-awesome-icon icon="download" />
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


<style>
    .modal-download-selector .modal-xl {
        max-width: 570px;
    }
</style>
