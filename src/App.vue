<template>
  
  <v-app id="inspire">

    <div v-if="$route.name==='login'">
      <Login :onLogin="onLogin"/>
    </div>

    <div v-else>

      <v-app-bar
        app
        color="primary"
        dark
      >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>
          <v-btn
            color="white"
            text
            rounded
            class="my-2"
            @click="$router.push({ name: 'Home' })"
          >
            Мониторинг антивирусов
          </v-btn>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <ShowLogin :user_test="user_test"/>

          <v-menu
            bottom
            left
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                icon
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item>
                <ChangePassword />
              </v-list-item>

              <v-list-item>
                <LogOut/>
              </v-list-item>
            </v-list>
          </v-menu>

      </v-app-bar>

      <v-navigation-drawer
      :width="300"
      v-model="drawer"
      bottom
      temporary
      app
      class="pt-16"
      >

      <v-list flat>
        <v-list-item-group
          dense
          nav
        >
          <v-divider></v-divider>
          <v-list-item
            v-for="item in items"
            :key="item.title"
            @click="$router.push({ name: item.to })"
            link
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            @click="$router.push({ name: 'User' })"
            link
            v-if="$app.user && $app.user.is_superuser"
          >
            <v-list-item-icon>
              <v-icon> mdi-account-circle </v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Пользователи</v-list-item-title>
            </v-list-item-content>
          </v-list-item>


        </v-list-item-group>
      </v-list>

      </v-navigation-drawer>

      <v-main>
        <router-view></router-view>
      </v-main>
    </div>
  </v-app>
</template>

<script>
  import axios from 'axios';

  import ChangePassword from './components/ChangePassword.vue'
  import LogOut from './components/LogOut.vue'
  import ShowLogin from './components/ShowLogin.vue'

  import Login from './views/Login.vue'

  export default {
    components: {
      ChangePassword,
      LogOut,
      ShowLogin,
      Login,
    },
    data: () => ({
      user_test: '',
      drawer: false,
      items: [
          { title: 'Рабочие станции', icon: 'mdi-view-dashboard', to: 'Home'},
          { title: 'Парметры Антивируса', icon: 'mdi-image', to: 'Preferences'},
          { title: 'Журнал Событий', icon: 'mdi-help-box', to: 'Event'},
        ], 
      }
    ),

    methods: {

      onLogin() {
        this.user_test = this.$app.user.login
      },

      async check_user(){
        try {
          const response = await axios.get(
            '/current_user', 
          )
          if (response.status === 200) {
            this.$app.user = response.data
            this.user_test = this.$app.user.login
          }
        } catch(e) {
          if (e.response.status === 401) {
            this.$router.push({"name": "login"})
          }
        }
      },

    },

    destroyed () {
      this.user = null
    },

    created () {
      this.check_user();
    }

  }
</script>