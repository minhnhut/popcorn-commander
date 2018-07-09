<template>
    <div id='app'>
        <input type="text" v-model="search">
        <br/>
        {{result}}
        <br/>
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
            result: ""
        }),
        watch: {
            search: function()  {
                console.log(this.search);
                this.test();
            }
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

            // DataLayer.getRepository("Movie").findAll({
            //     where: {
            //         title: this.search
            //     }
            // }).then(data => {
            //     this.result = data;
            // })
            //   const test = ipcRenderer.send("datalink", {query:() => {

            //   }});
            //   console.log(test);
          }
        }
    }
</script>

<style>
    html {
        height: 100%;
    }
    body {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        margin: auto;
    }
    #app {
        color: #2c3e50;
        max-width: 600px;
        font-family: Source Sans Pro, Helvetica, sans-serif;
        text-align: center;
    }
    #app a {
        color: #42b983;
        text-decoration: none;
    }
    #app p {
        text-align: justify;
    }
    .logo {
        width: auto;
        height: 100px;
    }
</style>
