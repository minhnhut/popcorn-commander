<template>
    <b-table fixed small bordered hover :outlined="false" :fields="fields" :items="movies" thead-class="d-none" class="table-movie" @row-clicked="handleRowClicked">
        <template slot="thumbnail" slot-scope="data">
            <img :src="data.item.thumbnail_url" alt="" width="50" height="73">
        </template>
        <template slot="title" slot-scope="data">
            <h6>{{data.item.title}} <small v-if="data.item.year">({{data.item.year}})</small></h6>
            <p><font-awesome-icon icon="users" /> {{displayStars(data.item)}}</p>
        </template>
    </b-table>
</template>


<script>
const R = require("ramda")

export default {
    props: {
        movies: Array,
        selectedMovie: Object
    },
    data: () => ({
      fields: [
            {
                key: "thumbnail",
                label: "",
                class: "column-thumbnail"
            },
            {
                key: "title",
                label: "Title"
            },
        ]  
    }),
    methods: {
        handleRowClicked(movie, index) {
            this.$emit("item-click", movie);
        },
        displayStars: R.compose(
            R.join(", "),
            R.defaultTo([]),
            R.prop('star')
        )
        // rowClass(movie) {
        //     if (movie == selectedMovie) {
        //         return "success";
        //     }
        // }
    }
}
</script>

<style>
    .table-movie tr {
        cursor: pointer;
    }

    .table-movie .column-thumbnail {
        width: 60px;
        height: 73px;
    }
</style>
