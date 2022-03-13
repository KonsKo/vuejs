import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import ru from 'vuetify/lib/locale/ru'
import { Ripple } from 'vuetify/lib/directives'

Vue.use(Vuetify, {
  directives: {
    Ripple
  }
})

Vue.component('my-component', {
    methods: {
      changeLocale () {
        this.$vuetify.lang.current = 'ru'
      },
    },
  })

export default new Vuetify({
    icons: {
        iconfont: 'mdi',
    },
    lang: {
        locales: { ru },
        current: 'ru',
      },
});
