<template>
    <div id='app'>
        <b-navbar variant="dark" type="dark">
            <b-navbar-brand>Commander</b-navbar-brand>
        </b-navbar>
        
        <b-table striped bordered small :fields="fields" :items="result" thead-class="d-none">
            <template slot="title" slot-scope="data">
                {{data.item.year ? `${data.item.title} (${data.item.year})` : data.item.title}}
            </template>
        </b-table>
        <b-button variant="primary" @click="insert()">Test()</b-button>
    </div>
</template>

<script>
    import Hello from './components/Hello.vue'
    import { ipcRenderer } from 'electron'
    import DataLayer from './dal/DataLayer'

    // With shell.openExternal(url) is how
    // external urls must be handled, not href
    const shell = require('electron').shell

    export default {
        data: () => ({
            search: "",
            result: "",
            fields: [
                {
                    key: "title",
                    label: "Title"
                    // formatter: (value) => value.year ? `${value.title} (${value.year})` : value.title
                },
            ]
        }),
        watch: {
            search: function()  {
                console.log(this.search);
                this.test();
            }
        },
        created() {
            this.test();
        },
        methods: {
          link(url) {
            shell.openExternal(url)
          },
          insert() {
              DataLayer.exec(Db => {
                  const Movie = Db.getEntity("Movie");
                  Movie.create({
                      title: this.search,
                      year: "now"
                  });
              })
          },
          test() {

            DataLayer.exec(Db => {
                const Movie = Db.getEntity("Movie");
                Movie.findAll({
                    where: {
                        title: {
                            ":like": this.search + "%"
                        }
                    }
                }).then(data => {
                    this.result = data
                });
                // Db.getRepository("Movie").findAll({
                //     where: {
                //         title: this.search
                //     }
                // }).then(data => {
                //     this.result = data;
                // });
            });
          }
        }
    }
</script>

<style>
</style>
