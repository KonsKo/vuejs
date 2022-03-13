<template>
   <v-app id="inspire">
      <v-main>
        <v-alert 
          v-if="error" 
          type="error"
          dismissible
        >{{error}}
        </v-alert>
         <v-container fluid fill-height>
            <v-layout align-center justify-center>
               <v-flex xs12 sm8 md4>
                  <v-card class="elevation-12">
                     <v-toolbar dark color="primary">
                        <v-toolbar-title>Авторизация</v-toolbar-title>
                     </v-toolbar>
                     <v-card-text>
                        <v-form>
                           <v-text-field
                              v-model="login"
                              name="login"
                              id="name"
                              label="Логин"
                              type="text"
                              autocomplete="on"
                           ></v-text-field>
                           <v-text-field
                              v-model="password"
                              id="password"
                              name="password"
                              label="Пароль"
                              type="password"
                              autocomplete="on"
                               @keyup.enter="click_login"
                           ></v-text-field>
                        </v-form>
                     </v-card-text>
                     <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn 
                        color="primary" 
                        @click="click_login"
                        >
                        Авторизоваться
                        </v-btn>
                     </v-card-actions>
                  </v-card>
               </v-flex>
            </v-layout>
         </v-container>
      </v-main>
   </v-app>
</template>

<script>
import axios from 'axios';

export default {
  name: 'login',

  props: ['onLogin'],

  data () {
    return {
      noUser: false,
      login: null,
      password: null,
      error: null
    }
  },

  methods: {
    async click_login(){
      try {
        const response = await axios.post(
          '/login', 
          {
            "login": this.login,
            "password": this.password,
          }
          )
        if (response.status === 200) {
          this.check_user()
        } else {
          this.error = response.data
        }
      } catch(e) {
        if (e.response.status === 403) {
          this.error = "Ошибка ввода логина/пароля"
        } else {
          this.error = e.response.data
        }
      }
    },

    async check_user(){
        try {
          const response = await axios.get(
              '/current_user', 
          )
          if (response.status === 200) {
              this.$app.user = response.data
              this.onLogin(this.$app.user.login)
              this.$router.push({"name": "Home"})
          }
        } catch(e) {
        console.log('error')
      }
    },
  },

}

</script>

