<template>
    <div>
        <template v-if="downloader">
            <b-badge variant="warning" v-if="downloader.state !== 'error'" class="mb-0"><font-awesome-icon icon="spinner" pulse fixed-width />
                <template v-if="downloader.state == 'downloading'">
                    {{downloader.completedPercent}}% - {{displayHumanReadableSpeed(downloader.bytesPerSecond, 2)}}
                </template>
                <template v-else-if="downloader.state == 'finishing'">
                    Finishing
                </template>
                <template v-else-if="downloader.state == 'moving'">
                    Moving
                </template>
            </b-badge>
            <b-badge variant="danger" v-else class="mb-0">
                <font-awesome-icon icon="exclamation-triangle" fixed-width /> Error
            </b-badge>
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
                if (this.movie.current_download_id) {
                    const currentDownload = R.filter(download => download.id == this.movie.current_download_id, this.movie.downloads)
                    return currentDownload[0] ? currentDownload[0] : null;
                }
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