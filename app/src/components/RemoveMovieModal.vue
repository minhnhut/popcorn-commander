<template>
    <b-modal title="Delete movie confirmination" ref="removeConfirmModal" header-bg-variant="danger" @ok="ok">
            Are you sure you want to delete this movie from collection?
        </b-modal>
</template>

<script>
export default {
    data: () => ({
        movie: null
    }),
    methods: {
        show(movie) {
            this.$refs.removeConfirmModal.show();
            this.movie = movie;
        },
        ok() {
            this.$emit('ok', this.movie);
        }
    }
}
</script>
