<template>
    <v-btn
    color="deep-orange"
    dark
    @click="logout"
    >
    Выйти
    </v-btn>
</template>

<script>
    import axios from 'axios';

    export default {

        props: ['user'],

        data: () => ({
            pass1: null,
            pass2: null,
            twoFieldRules2: [
            v => !!v || 'Подтверждение пароля обязательно',
            v => (v === this.pass1) || 'Пароли должны совпадать',
            ],
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
            async logout(){
                try {
                const response = await axios.get(
                    '/logout', 
                )
                if (response.status === 200) {
                    this.$app.user = null
                    this.$router.push({"name": "login"})
                }
                } catch(e) {
                    console.log(e.response.data)
                }
            },
        },

    }

</script>