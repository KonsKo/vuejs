<template>
     <div class="text-center">
        <v-dialog
        v-model="dialog"
        width="500"
        >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
            color="primary"
            dark
            v-bind="attrs"
            v-on="on"
            >
            Изменить пароль
            </v-btn>
        </template>

        <v-card>
            <v-card-title>
            <span class="text-h5">Изменение пароля </span>
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
                        v-model="pass1"
                        label="Пароль для входа*"
                        hint="
                        Пароль должен быть не менее 16 символов,
                        содержать как минимум одну прописную и одну заглавную букву, 
                        включать как минимум одну цифру, 
                        иметь как минимум один из следующих знаков: !»№;%:?*()_+=/{}.
                        "
                        persistent-hint
                        :rules="passwdRules2"
                    ></v-text-field>
                    </v-col>
                    </v-row>

                    <v-row>
                    <v-col
                        cols="12"
                        sm="6"
                        md="12"
                    >
                    <v-text-field
                        v-model="pass2"
                        :rules="[
                        !!pass2 || 'Подтверждение пароля обязательно',
                        (pass1 === pass2) || 'Пароли должны совпадать',
                        ]"
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
    </div>
</template>

<script>
    import axios from 'axios';

    export default {

        props: ['user'],

        data: () => ({
            pass1: null,
            pass2: null,
            valid: false,
            dialog: false,
            user_c: null,
            passwdRules2: [
                v => !!v || 'Пароль обязателен',
                v => (v && v.length >= 16) || 'Пароль должен быть не менее 16 символов',
                v => /(?=.*[A-ZА-Я])/.test(v) || 'Пароль должен содержать букву в верхнем регистре',
                v => /(?=.*[a-zа-я])/.test(v) || 'Пароль должен содержать букву в нижекм регистре',
                v => /(?=.*[0-9])/.test(v) || 'Пароль должен содержать цифру',
                v => /(?=.*[!»№;%:?*()_+=/{}.])/.test(v) || 'Пароль должен содержать один специальный символ (!»№;%:?*()_+=/{}.)',
            ],
            }
        ),

        methods: {


            close(){
                console.log(this.user)
                this.dialog = false
                this.valid = false
                this.pass1 = null
                this.pass2 = null
            },

            async save () {
                console.log('rrr', this.user_c)
                await this.post_request()
                this.close()
            },

            async post_request(){
                try {
                const response = await axios.post(
                    '/password_change', 
                    {
                    "id": "self",
                    "password": this.pass1,
                    }
                )
                if (response.status === 200) {
                    this.success = 'Действие выполнено успешно'
                }
                else {
                    this.valid_error = response.data
                }
                } catch(e) {
                    this.error = e.response.data
                }
                this.close()
            },

            async check_user(){
                try {
                const response = await axios.get(
                    '/current_user', 
                )
                if (response.status === 200) {
                    this.user_c = response.data
                }
                } catch(e) {
                if (e.response.status === 401) {
                    this.$router.push({"name": "login"})
                }
                }
            },
        },


        watch: {
            dialog (val) {
                val || this.close()
            },
        },

        computed: {
            passwordConfirmationRule() {
                return (this.pass2 === this.pass1) || 'Password must match'
            }
        },

        async created() {
            await this.check_user;
        }

    }
</script>