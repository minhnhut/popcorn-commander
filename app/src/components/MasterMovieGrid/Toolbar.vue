<template>
    <div class="toolbar">
        <b-btn v-if="download && !movie.is_downloaded" variant="primary" @click="$emit('start-download-click')"><font-awesome-icon icon="play" /></b-btn>
        <b-btn v-if="!movie.is_downloaded && !download" variant="primary" @click="$emit('fetch-download-click')"><font-awesome-icon icon="download" /></b-btn>
        <b-btn v-else variant="default" @click="$emit('fetch-download-click')"><font-awesome-icon icon="sync" /></b-btn>
        <b-btn variant="danger" @click="$emit('remove-click')"><font-awesome-icon icon="trash" /></b-btn>
    </div>
</template>

<script>
const R = require('ramda');

export default {
    props: {
        movie: Object,
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
}
</script>
