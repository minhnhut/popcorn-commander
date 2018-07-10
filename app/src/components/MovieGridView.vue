<template>
    <b-table fixed striped bordered small hover :fields="fields" :items="movies" thead-class="d-none" class="table-movie" @row-clicked="handleRowClicked">
        <template slot="thumbnail" slot-scope="data">
            <img :src="data.item.thumbnail_url" alt="" width="50" height="73">
        </template>
        <template slot="title" slot-scope="data">
            {{data.item.year ? `${data.item.title} (${data.item.year})` : data.item.title}}
        </template>
    </b-table>
</template>


<script>
export default {
    props: {
        movies: Array,
        selectedMovie: Object
    },
    data: () => ({
      fields: [
            {
                key: "thumbnail_url",
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
        handleRowClicked(movie) {
            this.$emit("item-click", movie);
        },
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
        width: 50px;
        height: 73px;
    }
</style>
