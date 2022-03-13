<template>
  <v-card class="ma-10 pa-16">
  
    <v-card-title>Журнал Событий</v-card-title>

    <SnackBar :msg="alert_msg" :sb_flag="snackbar" :kind="sb_kind" @msg_back='sb_back'/>

    <v-card class="ma-5 pa-1" max-width="1500">
      <v-row class="mx-4">

        <v-col cols="4">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск"
            clearable
            @change="getEvents"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-select
            v-model="search_cat"
            :items="categories"
            label="Поиск по категориям"
            item-color="primary"
            clearable
            @change="getEvents"
          ></v-select>
        </v-col>

        <v-col cols="2" v-if="hosts">
          <v-select
            v-model="search_arm"
            :items="hosts"
            item-text="ip_address"
            item-value="id"
            label="Выберите АРМ"
            item-color="primary"
            clearable
            @change="getEvents"
          ></v-select>
        </v-col>

        <v-col cols="2">
          <v-menu
            ref="menu1"
            v-model="menu1"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="date1"
                label="Период с"
                persistent-hint
                prepend-icon="mdi-calendar"
                v-bind="attrs"
                v-on="on"
                clearable
              ></v-text-field>
            </template>
            <v-date-picker
              :allowed-dates="allowedDates1"
              v-model="date1"
              no-title
              @input="menu1 = false"
              @change="getEvents"
            ></v-date-picker>
          </v-menu>
        </v-col>

        <v-col cols="2">
          <v-menu
            v-model="menu2"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="date2"
                label="Период до"
                persistent-hint
                prepend-icon="mdi-calendar"
                v-bind="attrs"
                clearable
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              :allowed-dates="allowedDates2"
              v-model="date2"
              no-title
              @input="menu2 = false"
              @change="getEvents"
            ></v-date-picker>
          </v-menu>
        </v-col>

      </v-row>
      <v-row class="mx-4">

        <v-col cols="2" class="pa-6">
          <v-btn
            depressed
            color="primary"
            @click="getEvents"
          >
            Обновить журнал
          </v-btn>
        </v-col>


        <v-col cols="2" class="pa-6">
          <v-btn
            depressed
            color="primary"
            @click="cleanFilters"
          >
            Сбросить фильтры
          </v-btn>
        </v-col>

      </v-row>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="events"
      :items-per-page=100
      :search.sync="search"
      :loading="loading"
      :options.sync="options"
      :server-items-length="total"
      :footer-props="{
        itemsPerPageOptions: [10, 50, 100],
      }"

    >

      <template v-slot:item.host_ip="{item}">
        <span>{{ make_ip(item.host_id) }}</span>
      </template>

      <template v-slot:item.host_name="{item}">
        <span>{{ make_name(item.host_id) }}</span>
      </template>
      
      <template v-slot:item.notification_time="{item}">
        <span>{{ new Date(item.notification_time).toLocaleString("en-GB") }}</span>
      </template>

    </v-data-table>
  </v-card>
</template>

<script>
  import axios from 'axios';
  import debounce from 'debounce'

  import SnackBar from '../components/SnackBar.vue'

  export default {
    components: {
      SnackBar,
    },
    data () {
      return {
        alert_msg: null,
        snackbar: false,
        sb_kind: null,
        options: {
          page: 1,
          itemsPerPage: 50,
        },
        hosts: null,
        total: 100,
        loading: false,
        menu1: false,
        menu2: false,
        date1: null,
        date2: null,
        id_to_ip: null,
        id_to_name: null,
        categories: [
          'Конфигурация изменена', 
          'Обновление успешное',
          'Обновление не удалось',
          'Обновление: Нарушение',
          'Обновление баз',
          'Ошибка обновления баз',
          'Сканирование начато',
          'Сканирование остановлено',
          'Сканирование преостановлено',
          'Сканирование возобновлено',
          'Сканирование не удалось',
          'Сканирование выключено',
          'Сканирование включено',
          '__PowerShell error',
          '__Работоспособен',
          '__Отчет состояния', 
          '__Состояние определено', 
          ],
        search: null,
        search_main: null,
        search_cat: null,
        search_arm: null,
        headers: [
          {
            text: 'IP Адрес',
            align: 'start',
            value: 'host_ip',
            width: '5%',
          },
          {
            text: 'Имя АРМа',
            align: 'start',
            value: 'host_name',
             width: '7%',
          },
          { 
            text: 'Категория',
            width: '7%',
            value: 'category', 
            filter: value => {
              if (!this.search_cat) return value
              return value === this.search_cat
            } 
          },
          { 
            text: 'Время обнаружения',
            width: '7%',
            value: 'notification_time',
            filter: value => {
              if (!this.dates) return value
              if (this.dates[0] && !this.dates[1]) return value >= this.dates[0]
              if (this.dates[1] && !this.dates[0]) return value <= this.dates[0]
              if (this.dates[1] < this.dates[0]) {this.swap()}
              return value <= this.dates[1] && value >= this.dates[0]
            } 
          },
          { text: 'Описание', value: 'description',  width: '74%',},
        ],
        events: [],
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

      async getEvents(){
        this.loading = true
        const payload = {
          "count": 1,
          "model": "event",
          "orders": ["-id"],
          "skip": 0 + (this.options.page -1) * this.options.itemsPerPage,
          "limit": this.options.itemsPerPage,
          "filters": {},
        }
        payload.filters["AND"] = {}
        if (this.search_cat) {
          payload.filters["AND"]["category"] = this.search_cat
        }
        if (this.date1) {
          try {
            var d1 = new Date(this.date1);
            payload.filters["AND"]["notification_time__ge"] = d1.toISOString().substring(0, 19)
          } catch(e) {
            this.do_alert('Дата начала периода введена с ошибкой', 'error')"
          }
        }
        if (this.date2) {
          try {
            var d2 = new Date(this.date2);
            d2.setUTCHours('23','59','59')
            payload.filters["AND"]["notification_time__le"] = d2.toISOString().substring(0, 19)
          } catch(e) {
            this.do_alert('Дата конца периода введена с ошибкой', 'error')
          }
        }
        if (this.search) {
          payload.filters["OR"] = {
            "description__like": this.search,
            "category__like": this.search,
            "host_id__in": this.search_hosts(),
          }
        }
        if (this.$route.query.host_id) {
          this.search_arm = parseInt(this.$route.query.host_id)
          this.$router.replace({'query': null});
        }
        if (this.search_arm) {
          payload.filters["AND"]["host_id"] = parseInt(this.search_arm)
        }
        try {
          let response = await axios.post(
            '/data', 
            payload
          )
          this.total = parseInt(response.headers["x-data-count"])
          this.events = response.data;
        } catch(e) {
          this.do_alert(e.response.data, 'error')
          if (e.response.status === 401) {
            this.$router.push({"name": "login"})
          }
        }
        this.loading = false
      },

      async getHosts(){
        try {
          let response = await axios.post(
            '/data', 
            {
              "model": "host",
            }
          )
          this.hosts = response.data
          var changed = {}
          var changed2 = {}
          this.hosts.forEach(
            function(host) {
              var new_key = host.id;
              var new_val = host.ip_address;
              var new_name = host.name
              changed[ new_key ] = new_val;
              changed2[ new_key ] = new_name;
            }
          )

          this.id_to_ip = changed
          this.id_to_name = changed2
        } catch(e) {
          this.do_alert(e.message, 'error')
          if (e.response.status === 401) {
            this.$router.push({"name": "login"});
          }
        }
      },

      search_hosts(){
        var s = this.search
        var searched_hosts = this.hosts.filter(
          function(el) {
            return (el.ip_address.includes(s) || el.name.includes(s))
          }
        ).map(({id}) => id)
        return searched_hosts
      },

      check_date() {
        if (this.dates) {return this.dates[0]} else {return ''}
      },

      make_ip(id) {
        return this.id_to_ip[id];
      },

      make_name(id) {
        return this.id_to_name[id];
      },

      cleanFilters() {
        if (this.$route.query.host_id) {
          this.$router.replace({'query': null});
        }
        this.search = null
        this.date1 = null
        this.date2 = null
        this.search_cat = null
        this.search_arm = null
        this.total = 100
        this.options = {
          page: 1,
          itemsPerPage: 50,
        }
      },

      swap() {
        var tmp = this.dates[0]
        this.dates[0] = this.dates[1]
        this.dates[1] = tmp
      },

      allowedDates1(val) {
        if (this.date2) {
          var d2 = new Date(this.date2)
          return new Date(val) <= new Date() && new Date(val) <= d2
        }
        return new Date(val) <= new Date()
      }, 

      allowedDates2(val) {
        var d1 = new Date(this.date1)
        return (new Date(val) >= d1 && new Date(val) <= new Date())
      },

    },

    watch: {
      options: {
        handler () {
          this.getEvents();
        },
        deep: true,
      },
      search_cat: {
        handler () {
          this.getEvents();
        },
        deep: true,
      },
      date1: {
        handler () {
          this.getEvents();
        },
        deep: true,
      },
      date2: {
        handler () {
          this.getEvents();
        },
        deep: true,
      },
      search: {
        handler () {
          debounce(this.getEvents, 1500);
        },
        deep: true,
      },
    },

    async created() {
      await this.getHosts();
    },

    destroyed() {
      this.events = null
    }

  }
</script>