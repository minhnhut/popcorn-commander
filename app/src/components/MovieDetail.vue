<template>
    <div>
        <img class="thumbnail mb-1" :src="movie.thumbnail_url" :alt="movie.title">
        <h3>{{movie.title}}</h3>
        <p class="year" v-if="movie.year">({{movie.year}})</p>
        <p>
            <b-badge v-if="movie.duration" variant="success"><font-awesome-icon icon="clock" /> {{movie.duration}}</b-badge>
            <b-badge variant="warning"><font-awesome-icon icon="star" /> {{movie.reviewStar}}</b-badge>
        </p>
        <h3>
            Genre:
        </h3>
        <p>
            <b-badge :key="index" v-for="(genre, index) in movie.genre.split(', ')" variant="primary" class="mr-1">{{genre}}</b-badge>
        </p>
        <h3>
            Plot:
        </h3>
        <p v-if="movie.description">
            {{movie.description}}
        </p>
        <h3>
            Cast:
        </h3>
        <p>
            <b-badge :key="index" v-for="(item, index) in movie.star.split(', ')" variant="info" class="mr-1"><font-awesome-icon icon="user" />  {{item}}</b-badge>
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
