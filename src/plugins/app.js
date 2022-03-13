import Vue from 'vue';
import moment from 'moment-timezone'

moment.tz.setDefault('Moscow')

class App {


    constructor() {
        this.user = null;
    }

}

export class AppPlugin {

    static install(Vue) {

        const app = new App();

        Object.defineProperty(Vue.prototype, '$app', {
            get() {
                return app
            }
        });
    }

}


Vue.use(AppPlugin);