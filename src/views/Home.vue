<template>

  <v-card class="ma-10 pa-16">
    <v-card-title>
      
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Поиск"
        single-line
        hide-details
        clearable
      ></v-text-field>
    </v-card-title>

    <SnackBar :msg="alert_msg" :sb_flag="snackbar" :kind="sb_kind" @msg_back='sb_back'/>

    <v-data-table
      v-model="selected"
      item-key="id"
      :sort-by="['id']"
      :headers="headers"
      :items="t_hosts"
      :items-per-page=-1
      :footer-props="{
          'items-per-page-options': [10, 25, 50, 100, 200,-1]
        }"
      :search="search"
      show-select
      class="elevation-1"
      :item-class="itemRowBackground"
    >

      <template
        v-slot:item.data-table-select="{ isSelected, select, item }"
      >
        <v-tooltip 
          left 
          :disabled="item.state==1"
          color="red"
        >
           <template v-slot:activator="{ on, attrs }">
             <span
              v-bind="attrs"
              v-on="on"
            >
              <v-simple-checkbox
                :disabled="item.state!=1"
                :value="isSelected"
                @input="select($event)"
                color="green"
                ripple
              ></v-simple-checkbox>
             </span>
           </template>
           <span v-if="item.state==2">Выбор невозможен: соединение отсутствует.</span>
           <span v-if="item.state==3">Выбор невозможен: ошибка модуля управления.</span>
        </v-tooltip>
      </template>

      <template v-slot:item.name="{item}">
        <router-link :to="{ name: 'Event', query: { host_id: item.id }}">{{ item.name }}</router-link>
      </template>

      <template v-slot:item.description="{item}">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span
              v-bind="attrs"
              v-on="on"
              v-if="item.description.length>=28"
            >{{ item.description.substring(0,28)+"  ..." }}</span>
            <span
              v-bind="attrs"
              v-on="on"
              v-else
            >{{ item.description }}</span>
          </template>
          <span>{{ item.description }}</span>
        </v-tooltip>
      </template>

      <template 
        v-slot:item.state_category="{item}"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span
              v-bind="attrs"
              v-on="on"
            >{{ item.state_category }}</span>
          </template>
          <span>{{ item.state_description }}</span>
        </v-tooltip>
      </template>

      <template 
        v-slot:item.state="{item}"
      >
        <v-icon v-if="item.state == '1'"
          color="green"
        >
          mdi-lan-connect
        </v-icon>
        <v-icon v-else-if="item.state == '2'"
          color="red"
        >
          mdi-lan-disconnect
        </v-icon>
        <v-icon v-else-if="item.state == '3'"
          color="orange"
        >
          mdi-powershell
        </v-icon>
      </template>

      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>Рабочие станции</v-toolbar-title>
          <v-spacer></v-spacer>
          
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >

            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                Добавить АРМ
              </v-btn>
              <v-col class="text-right">
              
              <v-btn
                color="primary"
                :disabled="!has_one"
                class="mb-2"
                @click="clickButton1"
              >
                Начать Сканирование
              </v-btn>
              
              </v-col>
            </template>

            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

            <v-form
              ref="form"
              v-model="valid"
            >
              <v-container>

                <v-row>
                  
                  <v-col
                    cols="12"
                    sm="6"
                    md="12"
                  >
                    <v-text-field
                      v-model="editedItem.name"
                      label="Имя АРМа*"
                      :rules="nameRules"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col
                    cols="12"
                    sm="6"
                    md="12"
                  >
                    <v-text-field
                      v-model="editedItem.ip_address"
                      label="IP адрес*"
                      :rules="ipRules"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col
                    cols="12"
                    sm="6"
                    md="12"
                  >
                    <v-text-field
                      v-model="editedItem.description"
                      label="Описание"
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
                    Отменить
                  </v-btn>
                  <v-btn
                    :disabled="!valid"
                    color="blue darken-1"
                    @click="save"
                  >
                    Сохранить
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card>

          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="550px">
            <v-card>
              <v-card-title class="text-h5">Вы уверены, что хотите удалить элемент?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Отменить</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          class="mr-2"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>

      <template v-slot:item.scan="{ item }">
        <v-tooltip 
          left 
          :disabled="item.state==1"
          color="red"
        >
          <template v-slot:activator="{ on, attrs }">
            <span
              v-bind="attrs"
              v-on="on"
            >
              <v-icon
                :disabled="item.state!=1"
                @click="startScan(item)"
              >
                mdi-arrow-right-bold-circle
              </v-icon>
            </span>
          </template>
         <span v-if="item.state==2">Сканирование невозможно: соединение отсутствует.</span>
         <span v-if="item.state==3">Сканирование невозможно: ошибка модуля управления.</span>
        </v-tooltip>
      </template>

    </v-data-table>

  </v-card>
</template>

<script>
  import axios from 'axios';

  import SnackBar from '../components/SnackBar.vue'

  export default {
    name: 'home',
    components: {
      SnackBar,
    },
    data () {
      return {
        sb_kind: null,
        has_one: true,
        soc: null,
        snackbar: false,
        alert_msg: null,
        valid: false,
        dialog: false,
        dialog2: false,
        dialogDelete: false,
        t_hosts: [],
        nameRules: [
          v => !!v || 'Имя обязательно',
          v => (v && v.length >= 2) || 'Имя должно быть не меньше 2 символов',
          v => (v && v.length <= 32) || 'Имя должно быть не больше 32 символов',
        ],
        ipRules: [
          v => !!v || 'Адрес обязателен',
          v => /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(v) || 'IP адресс должен быть валидный',
        ],
        selected: [],
        search: '',
        editedIndex: -1,
        editedItem: {
          name: '',
          ip_address: '',
          policy_version: 1,
          description: ' ',
          type: 2,
          state: 2,
        },
        defaultItem: {
          name: '',
          ip_address: '',
          policy_version: 1,
          description: ' ',
          type: 2,
          state: 2,
        },
        headers: [
          { text: 'ID', align: 'center', value: 'id', width: '3%'},
          { text: 'IP адрес', align: 'start', value: 'ip_address', width: '10%'},
          { text: 'Имя АРМа', align: 'start', value: 'name',  width: '17%'},
          { text: 'Описание', align: 'start', value: 'description', width: '20%'},
          { text: 'Крайнее обновление', align: 'start', value: 'am_released', width: '7%'},
          { text: 'Версия АВ БД', align: 'start', value: 'am_version', width: '8%'},
          { text: 'Состояние', align: 'start', value: 'state', width: '8%'},
          { text: 'Категория последней операции', align: 'start', value: 'state_category', width: '15%'},
          { text: 'Действия', value: 'actions', sortable: false, width: '7%', align: 'center'},
          { text: 'Сканирование', value: 'scan', sortable: false, width: '5%', align: 'center'},
        ],
      }
    },

    methods: {

      sb_back (msg_back) {
        this.snackbar = msg_back
      },

      async getHosts(){
        try {
          let response = await axios.post(
            '/data', 
            {
              "model": "host",
            }
          )
          this.t_hosts = response.data
        } catch(e) {
          this.do_alert(e.response.data, 'error')
          if (e.response.status === 401) {
            this.$router.push({"name": "login"})
          }
        }
      },

      async clickButton1(){
        let sel = []
        this.selected.forEach(function(elem) {
          if (elem.state == 1) {
            sel.push(elem.ip_address);
          }
        });
        if (sel.length < 1) {
          this.do_alert('At least one item should be selected', 'error')
        } else {
          this.control_request(sel)
        }
      },

      editItem (item) {
        this.editedIndex = this.t_hosts.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.editedIndex = this.t_hosts.indexOf(item)
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

      startScan (item) {
        this.control_request([item.ip_address])
      },

      close () {
        this.dialog = false
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
        this.getHosts()
        this.close()
      },

      editBySoc(e_data){
        const tmp_data = JSON.parse(e_data)
        if ('data' in tmp_data) {
          this.t_hosts.forEach(function(item){
            if (item.ip_address == tmp_data.data.host_ip) {
              if (tmp_data.data.category === '__Нет связи') {
                item.state = 2
              } else if (tmp_data.data.category === '__Связь ОК'){
                item.state = 1
              } else if (tmp_data.data.category.includes('PowerShell') && item.state == 1 ){
                item.state = 3
              } else if (!tmp_data.data.category.startsWith('__')) {
                if (item.state == 3) {item.state = 1}
                item.state_description = tmp_data.data.message;
                item.state_category = tmp_data.data.category;
              }
            }
          });
        }
      },

      wsOnMesage(event){
        try {
          this.editBySoc(event.data);
        } catch(e) {
          this.do_alert(e, 'error')
        }
      },

      socket_process() {
        try {
          this.soc = new WebSocket('ws://' + window.location.host + '/ws');
          this.soc.onopen = function () {
            console.log('Connected');
          }
        } catch(e) {
          this.do_alert(e.response.data, 'error')
        }
        this.soc.onmessage = this.wsOnMesage
      },

      async post_request(action){
        try {
          const response = await axios.post(
            '/data_change', 
            {
              "model": "host",
              "action": action,
              "id": this.editedItem.id,
              "data": this.editedItem,
            }
          )
          if (response.status === 200) {
            this.do_alert('Действие прошло успешн', 'success')
          } else {
            this.do_alert(response.data, 'error')
          }
        } catch(e) {
          this.do_alert(this.convert_error(e.response.data), 'error')
          if (e.response.status === 401) {
            this.$router.push({"name": "login"})
          }
        }
        this.t_hosts.splice(this.editedIndex, 1)
        this.closeDelete()
      },

      async control_request(hosts){
        try {
          const response = await axios.post(
            '/action', 
            {
              "action": "CONTROL",
              "data": {
                "event": "Start-MpScan",
                "hostnames": hosts,
              },
            }
          )
          if (response.status === 200) {
            this.do_alert('Команда отправлена', 'success')
          } else {
            this.do_alert(response.data, 'error')
          }
        } catch(e) {
          this.do_alert(e.response.data, 'error')
          if (e.response.status === 401) {
            this.$router.push({"name": "login"})
          }
        }
      },

      convert_error(error_msg){
        try {
          if (error_msg.includes('duplicate key value violates unique constraint')) {
            var pattern = /host_(\w+)_key/;
            let result = error_msg.match(pattern)
            var main_msg_new = `Значение должно быть уникальным для параметра: ${result[1]}`;
            return error_msg.replace(error_msg, main_msg_new)
          } else {
            return error_msg
          }
        } catch(e) {
          return error_msg
        }
      },

      itemRowBackground: function (item) {
        return 'blink' in item ? 'style-2' : 'style-1'
      },

      do_alert(msg, new_kind) {
        this.alert_msg = msg
        this.snackbar = true
        this.sb_kind = new_kind
      },

    },

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Новое АРМ' : 'Изменение АРМ'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
      '$data': {
        handler: function() {
          if (this.selected.length > 0) {this.has_one = true} else {this.has_one = false}
        },
        deep: true
      }
    },

    async created() {
      await this.getHosts();
      this.socket_process();
    },

    destroyed() {
      if (this.soc) {this.soc.close()}
    }
  }
</script>

<style>
a {
    text-decoration: none;
}

.style-1 {
  background-color: rgb(255, 255, 255)
}
.style-2 {
  background-color: rgb(114, 67, 77)
}

.v-data-table-header th {
  white-space: nowrap;
}

</style>
