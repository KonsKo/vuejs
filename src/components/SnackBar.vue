<template>
   <v-snackbar
      v-if="kind=='success'"
      v-model="snackbar_flag"
      color="success"
      :timeout="2500"
      centered
      text
      outlined
    >
      {{ sb_msg }}
    </v-snackbar>

    <v-snackbar
      v-else-if="kind=='error'"
      v-model="snackbar_flag"
      color="error"
      :timeout="4000"
      centered
      text
      outlined
    >
      {{ sb_msg }}
    </v-snackbar>
</template>

<script>

export default {

    props: {
      msg: String,
      sb_flag: Boolean,
      kind: String,
    },

    data() {
      return {
        snackbar_flag: this.snackbar,
      }
    },

    methods: {
      do_sb() {
        this.$emit('msg_back', this.snackbar_flag)
      }
    },
    computed: {
      sb_msg () {
        return this.msg
      },
      snackbar () {
        return this.sb_flag
      }
    },

    watch: {
      snackbar: function(new_v) {
        this.snackbar_flag = new_v
      },
      snackbar_flag: function() {
        this.do_sb()
      }
    },

}
</script>