<template>
    <p class="mb-0">
        <font-awesome-icon icon="users" fixed-width />
        {{movie.star}}
        <!-- <b-badge :key="index" v-for="(item, index) in toArray(movie.star)" variant="info" class="mr-1">
            <font-awesome-icon icon="user" />  {{item}}
        </b-badge> -->
    </p>
</template>

<script>
const R = require("ramda");

export default {
    props: {
        movie: Object
    },
    methods: {
        toArray: R.split(", ")
    }
}
</script>

<style scoped>
    p {
        font-size: 11px;
    }
</style>
