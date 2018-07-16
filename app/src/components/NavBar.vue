<template>
    <b-navbar variant="dark" type="dark">
        <b-navbar-brand>Commander</b-navbar-brand>
        <b-nav-form>
            <download-folder-button class="mr-2" />
            <b-input-group class="mr-2">
                <b-input-group-text slot="prepend" class="bg-secondary text-light">
                    <font-awesome-icon icon="search" />
                </b-input-group-text>
                <b-form-input v-model="search" class="bg-dark text-light" type="text" placeholder="Search"></b-form-input>
            </b-input-group>
            <b-btn @click="$emit('add-new-click')" variant="primary"><font-awesome-icon icon="plus"/></b-btn>
        </b-nav-form>
    </b-navbar>
</template>

<script>
import DownloadFolderButton from "./NavBar/DownloadFolderButton.vue"

export default {
    data: () => ({
        search: ""
    }),
    components: {
        DownloadFolderButton
    },
    watch: {
        search() {
            this.$emit("search", this.search);
        }
    }
}
</script>
