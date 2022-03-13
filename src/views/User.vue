<template>
  <v-card class="ma-10 pa-16">
    <v-card-title>
      Пользователи
      <v-spacer></v-spacer>
      <v-col cols="6">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          clearable
        ></v-text-field>
      </v-col>
    </v-card-title>

    <SnackBar :msg="alert_msg" :sb_flag="snackbar" :kind="sb_kind" @msg_back='sb_back'/>

    <v-data-table
      :headers="headers"
      :items="users"
      :search="search"
      :items-per-page=-1
      :footer-props="{
          'items-per-page-options': [-1]
        }"
    >
    
      <template v-slot:top>
        <v-toolbar
          flat
        >

          <v-spacer></v-spacer>
          <v-dialog
            v-model="dialog"
            max-width="700px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-if="show"
                color="primary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
                name="new_user"
              >
                Новый Пользователь
              </v-btn>
            </template>

            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }} 
                   <span class="text-h5" v-if="formTitle == 'Редактирование пользователя'"> : {{ editedItem.login }}</span>
                </span>
              </v-card-title>

              <v-form
                ref="form"
                v-model="valid"
              >
                <v-container>
                  <v-row v-if="event_name != 'ch_pass'">
                    <v-col
                      cols="12"
                      sm="6"
                      md="12"
                    >
                    <v-text-field
                      v-model="editedItem.name"
                      label="Имя пользователя"
                      required
                    ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row v-if="event_name != 'ch_pass'">
                    <v-col
                      cols="12"
                      sm="6"
                      md="12"
                    >
                    <v-text-field
                      v-model="editedItem.login"
                      label="Логин*"
                      required
                      :rules="loginRules"
                    ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row v-if="event_name != 'ch_pass'">
                    <v-col
                      cols="12"
                      sm="6"
                      md="12"
                    >
                    <v-switch
                      v-model="editedItem.is_superuser"
                      inset
                      label="Сделать суперпользователем"
                    ></v-switch>
                    </v-col>
                  </v-row>

                  <v-row v-if="event_name != 'ch_pass'">
                    <v-col
                      cols="12"
                      sm="6"
                      md="12"
                    >
                    <v-switch
                      v-model="editedItem.disabled"
                      inset
                      label="Заблокировать"
                    ></v-switch>
                    </v-col>
                  </v-row>

                  <v-row v-if="event_name != 'edit'">
                    <v-col
                      cols="12"
                      sm="6"
                      md="12"
                    >
                    <v-text-field
                      v-model="editedItem.passwd"
                      label="Пароль для входа*"
                      hint="
                      Пароль должен быть не менее 16 символов,
                      содержать как минимум одну прописную и одну заглавную букву, 
                      включать как минимум одну цифру, 
                      иметь как минимум один из следующих знаков: !»№;%:?*()_+=/{}.
                      "
                      persistent-hint
                      :rules="passwdRules"
                    ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row v-if="event_name != 'edit'">
                    <v-col
                      cols="12"
                      sm="6"
                      md="12"
                    >
                    <v-text-field
                      v-model="repassword"
                      :rules="twoFieldRules"
                      label="Подтверждение пароля*"
                    ></v-text-field>
                    </v-col>
                  </v-row>

                </v-container>


                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    @click="close"
                  >
                    Отмена
                  </v-btn>
                  <v-btn
                    color="blue darken-1"
                    :disabled="!valid"
                    @click="save"
                  >
                    Сохранить
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="700px">
            <v-card>
              <v-card-title class="text-h5">Вы уверены, что хотите удалить пользователя?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Отмена</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          v-if="show"
          class="mr-2"
          name='edit'
          @click="editItem(item, $event)"
        >
          mdi-pencil
        </v-icon>

          <v-icon
            v-if="show"
            class="mr-2"
            name='ch_pass'
            @click="editItem(item, $event)"
          >
            mdi-key
          </v-icon>

        <v-icon
          class="mr-2"
          v-if="show && cur_user.id != item.id"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>

      </template>

      <template v-slot:item.disabled="{item}"> {{ item.disabled ? 'Да' : 'Нет' }} </template>

       <template v-slot:item.is_superuser="{item}"> {{ item.is_superuser ? 'Да' : 'Нет' }} </template>

    
    </v-data-table>
  </v-card>
</template>

<script>
import axios from 'axios';

import SnackBar from '../components/SnackBar.vue'

export default {
  name: 'user',
  components: {
      SnackBar,
    },
  data () {
    return {
      sb_kind: null,
      snackbar: false,
      alert_msg: null,
      event_name: null,
      show: true,
      repassword: '',
      users: [],
      search: '',
      valid: false,
      dialog: false,
      dialog_pass: false,
      dialogDelete: false,
      bool_list: [true, false],
      twoFieldRules: [
          v => (v === this.editedItem.passwd) || 'Пароли должны совпадать',
          v => !!v || 'Подтверждение пароля обязательно',
        ],
      passwdRules: [
          v => !!v || 'Пароль обязателен',
          v => (v && v.length >= 16) || 'Пароль должен быть не менее 16 символов',
          v => /(?=.*[A-ZА-Я])/.test(v) || 'Пароль должен содержать букву в верхнем регистре',
          v => /(?=.*[a-zа-я])/.test(v) || 'Пароль должен содержать букву в нижекм регистре',
          v => /(?=.*[0-9])/.test(v) || 'Пароль должен содержать цифру',
          v => /(?=.*[!»№;%:?*()_+=/{}.])/.test(v) || 'Пароль должен содержать один специальный символ (!»№;%:?*()_+=/{}.)',
        ],
      loginRules: [
          v => !!v || 'Логин обязателен',
          v => (v && v.length >= 2) || 'Логин должен быть не меньше 2 символов',
          v => (v && v.length <= 32) || 'Логин должен быть не больше 32 символов',
        ],
      headers: [
        { text: 'Логин', value: 'login' },
        { text: 'Имя пользователя', value: 'name' },
        { text: 'Заблокирован', value: 'disabled' },
        { text: 'Суперпользователь', value: 'is_superuser' },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center'},
      ],
      editedIndex: -1,
      editedItem: {
        name: '',
        login: '',
        disabled: false,
        is_superuser: false,
        passwd: '',
      },
      defaultItem: {
        name: '',
        login: '',
        disabled: false,
        is_superuser: false,
        passwd: '',
      },
    }
  },

  methods: {
    sb_back (msg_back) {
        this.snackbar = msg_back
      },
    
    do_alert(msg, new_kind) {
        this.alert_msg = msg
        this.snackbar = true
        this.sb_kind = new_kind
      },
    
    async getUsers(){
      try {
        let response = await axios.post(
          '/data', 
          {
            "model": "users",
          }
        )
        this.users = response.data
      } catch(e) {
        this.do_alert(e.response.data, 'error')
      }
    },

    editItem (item, event) {
        this.event_name = event.target.name
        this.editedIndex = this.users.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

    deleteItem (item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    async deleteItemConfirm () {
      await this.post_request("delete")
    },
    
    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    close () {
      this.event_name = null
      this.dialog = false
      this.valid = false
      this.repassword = null
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save () {
      if (this.editedIndex > -1) {
        await this.post_request("update")
      } else {
        await this.post_request("insert")
      }
      this.getUsers()
      this.close()
      this.editedIndex = -1
    },

    async post_request(action){
      try {
        const response = await axios.post(
          '/data_change', 
          {
            "model": "users",
            "action": action,
            "id": this.editedItem.id,
            "data": this.editedItem,
          }
        )
        if (response.status === 200) {
          this.do_alert('Действие выполнено успешно', 'success')
        }
        else {
          this.do_alert(response.data, 'error')
        }
      } catch(e) {
        this.do_alert(this.convert_error(e.response.data), 'error')
      }
      this.users.splice(this.editedIndex, 1)
      this.closeDelete()
    },

    async check_user(){
      try {
        const response = await axios.get(
          '/current_user', 
        )
        if (response.status === 200) {
          this.cur_user = response.data
          this.show = this.cur_user.is_superuser
        }
      } catch(e) {
        if (e.response.status === 401) {
          this.$router.push({"name": "login"})
        }
      }
    },

    convert_error(error_msg){
      try {
        var pattern = /_([a-z]+)"/;
        let result = error_msg.match(pattern)
        var main_msg_new = `Значение должно быть уникальным для параметра: ${result[1]}`;
        return error_msg.replace(error_msg, main_msg_new)
      } catch(e) {
        return error_msg
      }
    },
  },

  computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Новый пользователь' : 'Редактирование пользователя'
      },
    },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },

  async created() {
    await this.check_user();
    await this.getUsers();
  }
}

</script>
