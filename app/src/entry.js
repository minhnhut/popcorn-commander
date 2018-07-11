import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from "bootstrap-vue"
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import fontawesome from '@fortawesome/fontawesome';
import FontAwesomeIconSolid from "@fortawesome/fontawesome-free-solid";
import Notifications from 'vue-notification'

fontawesome.library.add(FontAwesomeIconSolid);
Vue.component(FontAwesomeIcon.name, FontAwesomeIcon);

Vue.use(BootstrapVue);
Vue.use(Notifications);

new Vue({
  el: '#app',
  render: h => h(App)
})
