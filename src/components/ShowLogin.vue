<template>
    <span > {{ user_test }}  </span>
</template>

<script>

export default {

    props: ['user_test'],

    data: () => ({
      user_c: null,
    }
    ),

}
</script>