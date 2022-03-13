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
      ></v-text-field>
    </v-card-title>

    <SnackBar :msg="alert_msg" :sb_flag="snackbar" :kind="sb_kind" @msg_back='sb_back'/>

    <v-data-table
      :headers="headers"
      :items="new_prefs"
      :items-per-page=-1
      class="elevation-1"
      :search="search"
      :footer-props="{
          'items-per-page-options': [100]
        }"
    >

      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>Параметры Антивируса</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <v-card>
              <v-card-title>
                <span class="text-h5">Редактирование параметра </span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col>
                       <v-row>
                         <v-col>
                          <p class="font-weight-black">
                            Параметр:  
                          </p>
                          </v-col>
                            <v-col>
                          <p class="text-decoration-underline">
                            {{ editedItem.name }}
                          </p>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>

                      <span v-if="typeof editedItem.value === 'boolean'">
                        <v-select
                          v-model="editedItem.value"
                          :items="bool_list"
                        ></v-select>
                      </span>

                      <span v-else-if="editedItem.name == 'RealTimeScanDirection'">
                        <v-select
                          v-model="editedItem.value"
                          :items="scan_direction"
                          item-text="name"
                          item-value="id"
                        ></v-select>
                      </span>

                      <span v-else-if="
                      editedItem.name == 'RemediationScheduleDay' || 
                      editedItem.name == 'ScanScheduleDay' || 
                      editedItem.name == 'SignatureScheduleDay'">
                        <v-select
                          v-model="editedItem.value"
                          :items="day"
                          item-text="name"
                          item-value="id"
                        ></v-select>
                      </span>

                      <span v-else-if="editedItem.name == 'ScanParameters'">
                        <v-select
                          v-model="editedItem.value"
                          :items="scan_type"
                          item-text="name"
                          item-value="id"
                        ></v-select>
                      </span>

                      <span v-else-if="editedItem.name == 'MAPSReporting'">
                        <v-select
                          v-model="editedItem.value"
                          :items="maps_type"
                          item-text="name"
                          item-value="id"
                        ></v-select>
                      </span>

                      <span v-else-if="editedItem.name == 'SubmitSamplesConsent'">
                        <v-select
                          v-model="editedItem.value"
                          :items="ssc_type"
                          item-text="name"
                          item-value="id"
                        ></v-select>
                      </span>

                      <span v-else-if="
                      editedItem.name == 'DefinitionUpdatesChannel' ||
                      editedItem.name == 'EngineUpdatesChannel' ||
                      editedItem.name == 'PlatformUpdatesChannel' 
                      ">
                        <v-select
                          v-model="editedItem.value"
                          :items="uc_type"
                          item-text="name"
                          item-value="id"
                        ></v-select>
                      </span>

                      <span v-else-if="editedItem.name == 'PUAProtection'">
                        <v-select
                          v-model="editedItem.value"
                          :items="pua_type"
                          item-text="name"
                          item-value="id"
                        ></v-select>
                      </span>

                      <span v-else-if="
                      editedItem.name == 'ThreatIDDefaultAction_Actions' ||
                      editedItem.name == 'UnknownThreatDefaultAction' ||
                      editedItem.name == 'LowThreatDefaultAction' ||
                      editedItem.name == 'ModerateThreatDefaultAction' ||
                      editedItem.name == 'HighThreatDefaultAction' ||
                      editedItem.name == 'SevereThreatDefaultAction'
                      ">
                        <v-select
                          v-model="editedItem.value"
                          :items="treat_action"
                          item-text="name"
                          item-value="id"
                        ></v-select>
                      </span>

                      <span v-else-if="
                      editedItem.name == 'RemediationScheduleTime' ||
                      editedItem.name == 'ScanScheduleQuickScanTime' ||
                      editedItem.name == 'ScanScheduleTime' ||
                      editedItem.name == 'SignatureScheduleTime'
                      ">
                        <v-row
                          justify="space-around"
                          align="center"
                        >
                          <v-time-picker
                            v-model="editedItem.value"
                            use-seconds
                            scrollable
                          ></v-time-picker>
                        </v-row>
                      </span>

                      <span v-else>
                        <v-text-field
                          v-model="editedItem.value"
                          label="Значение"
                        ></v-text-field>
                      </span>

                    </v-col>
            
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="close"
                >
                  Отмена
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
                >
                  Обновить
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogSave" max-width="750px">
            <v-card>
              <v-card-title class="text-h5">Вы уверены, что хотите обновить параметр? <br/>  Изменения будут применены ко всем АРМам немедленно.</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeSave">Отмена</v-btn>
                <v-btn color="blue darken-1" text @click="saveConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip 
          left
        >
          <template v-slot:activator="{ on, attrs }">
            <span
              v-bind="attrs"
              v-on="on"
            >
              <v-icon
                class="mr-2"
                @click="editItem(item)"
                v-if="do_not_show(item.name)"
                color="light-blue darken-2"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                class="mr-2"
                disabled
                color="deep-orange darken-2"
                v-else
              >
                mdi-cancel
              </v-icon>
            </span>
          </template>
          <span v-if="!do_not_show(item.name)"> Параметр только для чтения </span>
          <span v-else>  Изменить параметр </span>
        </v-tooltip>
      </template>

    </v-data-table>
  
  </v-card>
</template>

<script>
  import axios from 'axios';

  import SnackBar from '../components/SnackBar.vue'

  export default {
    components: {
      SnackBar,
    },
    data: () => ({
      sb_kind: null,
      cur_prefs_id: null,
      search: '',
      snackbar: false,
      bool_list: [true, false],
      day: null,
      scan_direction: null,
      scan_type: null,
      maps_type: null,
      ssc_type: null,
      pua_type: null,
      uc_type: null,
      treat_action: null,
      alert_msg: null,
      valid_error: null,
      prefs: [],
      //new_prefs: [],
      dialog: false,
      dialogSave: false,
      headers: [
        { text: 'Имя Параметра', value: 'name', width: '40%'},
        { text: 'Текущее Значение', value: 'value', width: '40%' },
        { text: 'Действия', value: 'actions', sortable: false, width: '10%' },
      ],
      editedItem: {
        name: '',
        value: '',
      },
      defaultItem: {
        name: '',
        value: '',
      },
    }),

    methods: {

      do_not_show(pref_name) {
        var no_edit = [
          'SignatureDefinitionUpdateFileSharesSources', 
          'SignatureFallbackOrder',
        ]
        if (no_edit.indexOf(pref_name) == -1) return true
        else return false
      },

      do_alert(msg, new_kind) {
        this.alert_msg = msg
        this.snackbar = true
        this.sb_kind = new_kind
      },

      sb_back (msg_back) {
        this.snackbar = msg_back
      },

      async getPref(){
        try {
          let response = await axios.post(
            '/data', 
            {
              "model": "preferences_policy",
            }
          )
          this.prefs = response.data[0]
          this.cur_prefs_id = this.prefs.id
          delete this.prefs.id
          delete this.prefs.name
        } catch(e) {
          this.do_alert(e.response.data, 'error')
          //this.error = e.response.data
        }
      },

      async get_scan_direction(){
        this.scan_direction = await this.get_data("scan_direction")
      },

      async get_day(){
        this.day = await this.get_data("day")
      },

      async get_scan_type(){
        this.scan_type = await this.get_data("scan_type")
      },

      async get_maps_type(){
        this.maps_type = await this.get_data("maps_reporting_type")
      },

      async get_ssc_type(){
        this.ssc_type = await this.get_data("submit_samples_consent_type")
      },

      async get_treat_action(){
        this.treat_action = await this.get_data("threat_action")
      },

      async get_pua_type(){
        this.pua_type = await this.get_data("pua_protection_type")
      },

      async get_uc_type(){
        this.uc_type = await this.get_data("updates_channel_type")
      },

      editItem (item) {
        this.editedIndex = this.new_prefs.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      async saveConfirm () {
        try {
          var updated_pref = {}
          updated_pref[this.editedItem.name] = this.editedItem.value
          const response = await axios.post(
            '/data_change', 
            {
              "model": "preferences_policy",
              "action": "update",
              "id": this.cur_prefs_id,
              "data": updated_pref,
            }
          )
          if (response.status === 200) {
            this.do_alert('Действие прошло успешно', 'success')
            await this.getPref();
            await this.change_pref(this.editedItem.name, this.editedItem.value)
          } else {
            this.do_alert(response.data, 'error')
          }
        } catch(e) {
          this.do_alert(e.response.data, 'error')
        }
        this.closeSave()
        this.close()
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeSave () {
        this.dialogSave = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      save () {
        this.dialogSave = true
      },

      async get_data(model){
        try {
          let response = await axios.post(
            '/data', 
            {
              "model": model,
            }
          )
          return response.data
        } catch(e) {
          this.do_alert(e.response.data, 'error')
        }
      },

      async change_pref(pref, value){
        try {
          var new_pref = {}
          new_pref[pref] = value
          const response = await axios.post(
            '/action', 
            {
              "action": "CONTROL",
              "data": {
                "event": "Set-MpPreference",
                "hostnames": "all",
                "preferences": new_pref,
              },
            }
          )
          if (response.status === 200) {
            this.do_alert('Команда отправлена', 'success')
            this.do_alert('Команда отправлена')
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

      show_scan_direction(item_value) {
        console.log('item', item_value)
        this.scan_direction.forEach(element => {
          console.log(element.id, element.name)
          if (element.id == item_value) return element.name
        });
      },

    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeSave()
      },
    },

    computed: {
      new_prefs () {
        var new_p = []
        for (var [key, value] of Object.entries(this.prefs)) {
            if (key == 'RealTimeScanDirection') {
              this.scan_direction.forEach(
                function(el){
                  if (el.id == value) {value = el.name}
                }
              );
            } else if ([
                'RemediationScheduleDay',
                'ScanScheduleDay',
                'SignatureScheduleDay',
                ].includes(key)) {
              this.day.forEach(
                function(el){
                  if (el.id == value) {value = el.name}
                }
              );
            } else if (key == 'ScanParameters') {
              this.scan_type.forEach(
                function(el){
                  if (el.id == value) {value = el.name}
                }
              );
            } else if (key == 'MAPSReporting') {
              this.maps_type.forEach(
                function(el){
                  if (el.id == value) {value = el.name}
                }
              );
            } else if (key == 'SubmitSamplesConsent') {
              this.ssc_type.forEach(
                function(el){
                  if (el.id == value) {value = el.name}
                }
              );
            } else if ([
                'UnknownThreatDefaultAction',
                'LowThreatDefaultAction',
                'ModerateThreatDefaultAction',
                'HighThreatDefaultAction',
                'SevereThreatDefaultAction',
                ].includes(key)) {
              this.treat_action.forEach(
                function(el){
                  if (el.id == value) {value = el.name}
                }
              );
            } else if ([
                'DefinitionUpdatesChannel',
                'EngineUpdatesChannel',
                'PlatformUpdatesChannel',
                ].includes(key)) {
              this.uc_type.forEach(
                function(el){
                  if (el.id == value) {value = el.name}
                }
              );
            } else if (key == 'PUAProtection') {
              this.pua_type.forEach(
                function(el){
                  if (el.id == value) {value = el.name}
                }
              );
            }
            new_p.push({"name": key, "value": value});
          }
        
        return new_p
      },
    },

    async created() {
      await this.get_scan_direction();
      await this.get_day();
      await this.get_scan_type();
      await this.get_maps_type();
      await this.get_ssc_type();
      await this.get_treat_action();
      await this.get_pua_type();
      await this.get_uc_type();
      await this.getPref();
    },
  }
</script>
