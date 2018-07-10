<template>
    <div>
        <img class="thumbnail mb-1" :src="movie.thumbnail" :alt="movie.title">
        <h3>{{movie.title}}</h3>
        <p class="year" v-if="movie.year">({{movie.year}})</p>
        <p v-if="movie.description">
            {{movie.description}}
        </p>
    </div>
</template>

<script>
export default {
    props: {
        movie: Object
    }
}
</script>

<style scoped>
    img.thumbnail {
        width: 100%;
        height: 250px;
    }

    h3 {
        font-size: 15px;
    }

    p.year {
        font-size: 10px;
    }
</style>
