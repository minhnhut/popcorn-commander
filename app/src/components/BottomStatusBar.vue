<template>
    <b-row class="pl-1 pr-1 pt-1 bg-secondary text-light">
        <b-col>
            Total titles: {{total}}
        </b-col>
        <b-col class="text-right">
            <font-awesome-icon icon="download" />  Downloaded: {{downloaded}} / {{total}}
        </b-col>
    </b-row>
</template>


<script>
export default {
    props: {
        downloaded: Number,
        total: Number
    }
}
</script>

<style scoped>
    .row {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        /* border-top: 1px solid #dfdfdf; */
        background: #efefef;
        height: 25px;
        font-size: 12px;
    }
</style>
