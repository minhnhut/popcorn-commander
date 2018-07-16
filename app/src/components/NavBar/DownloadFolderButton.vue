<template>
    <b-btn variant="primary" @click="click">
        <font-awesome-icon icon="folder" />
    </b-btn>
</template>

<script>
const {shell} = require('electron')
import Downloader from "../../backend/Downloader"

export default {
    methods: {
        click() {
            if (Downloader.downloadFolderPath) {
                shell.showItemInFolder(Downloader.downloadFolderPath + "/.");
            }
        }
    }
}
</script>
