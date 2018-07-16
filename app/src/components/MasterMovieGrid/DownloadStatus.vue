<template>
    <div>
        <template v-if="downloader">
            <b-badge variant="warning" class="mb-0"><font-awesome-icon icon="spinner" pulse fixed-width /> {{downloader.completedPercent}}% - {{displayHumanReadableSpeed(downloader.bytesPerSecond)}}</b-badge>
        </template>
        <template v-else-if="movie.is_downloaded">
            <b-badge variant="success" class="mb-0"><font-awesome-icon icon="check" fixed-width /> Downloaded</b-badge>
        </template>
        <template v-else-if="download">
            <b-badge variant="primary" class="mb-0"><font-awesome-icon icon="download" fixed-width /> {{download.download_url}}</b-badge>
            <b-badge v-if="download.direct_url" variant="success" class="mb-0"><font-awesome-icon icon="download" fixed-width /> Direct url fetched</b-badge>
            <b-badge v-else variant="secondary" class="mb-0"><font-awesome-icon icon="download" fixed-width /> Direct url not fetched yet</b-badge>
        </template>
        <template v-else>
            <b-badge variant="secondary" class="mb-0"><font-awesome-icon icon="download" fixed-width /> No download link yet</b-badge>
        </template>
    </div>
</template>

<script>
const R = require("ramda");
const {utils} = require("rapid-downloader")

export default {
    props: {
        movie: Object,
        downloader: Object
    },
    computed: {
        download() {
            if (this.movie.downloads) {
                return this.movie.downloads[0];
            }
            return null;
        }
    },
    methods: {
        displayHumanReadableSpeed: utils.dynamicSpeedUnitDisplay
    }
}
</script>

<style scoped>
    /* div {
        font-size: 10px;
    } */
</style>