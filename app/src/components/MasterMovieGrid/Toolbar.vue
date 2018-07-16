<template>
    <div class="toolbar">
        <b-btn v-if="movie.is_downloaded" variant="default" @click="$emit('fetch-download-click')"><font-awesome-icon icon="sync" /></b-btn>
        <b-btn v-if="movie.downloads && movie.downloads.length && movie.downloads[0].direct_url && !movie.is_downloaded" variant="primary" @click="$emit('start-download-click')"><font-awesome-icon icon="play" /></b-btn>
        <b-btn v-else-if="!movie.is_downloaded" variant="primary" @click="$emit('fetch-download-click')"><font-awesome-icon icon="download" /></b-btn>
        <b-btn variant="danger" @click="$emit('remove-click')"><font-awesome-icon icon="trash" /></b-btn>
    </div>
</template>

<script>
export default {
    props: {
        movie: Object,
    },
}
</script>
